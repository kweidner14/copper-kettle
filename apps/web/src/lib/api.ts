import type { PaginatedDocs, Page } from './types'

// Read at build time by the prerendered content pages, so this must be the
// server-reachable URL for Payload, not necessarily the same as the public
// browser-facing one.
const API_URL = import.meta.env.PAYLOAD_API_URL ?? 'http://localhost:3000'

interface FetchOptions {
  /** Payload's `depth` param — how many levels of relationships/uploads to populate. */
  depth?: number
  limit?: number
  where?: Record<string, unknown>
}

async function payloadFetch<T>(collection: string, options: FetchOptions = {}): Promise<T> {
  const params = new URLSearchParams()
  if (options.depth !== undefined) params.set('depth', String(options.depth))
  if (options.limit !== undefined) params.set('limit', String(options.limit))
  if (options.where) params.set('where', JSON.stringify(options.where))

  const query = params.toString()
  const res = await fetch(`${API_URL}/api/${collection}${query ? `?${query}` : ''}`)

  if (!res.ok) {
    throw new Error(`Payload request failed: GET /api/${collection} (${res.status})`)
  }

  return res.json() as Promise<T>
}

// Payload is optional content, not a dependency of the storefront. Every page
// that reads it already renders without it, so an unreachable or failing CMS
// logs a warning and reads as "no content" rather than failing the whole build
// over an About page.
function warnUnavailable(error: unknown): void {
  console.warn(`[payload] ${API_URL} unavailable, rendering without CMS content: ${String(error)}`)
}

export async function getPages(depth = 1): Promise<Page[]> {
  try {
    const data = await payloadFetch<PaginatedDocs<Page>>('pages', { depth, limit: 100 })
    return data.docs
  } catch (error) {
    warnUnavailable(error)
    return []
  }
}

export async function getPage(slug: string, depth = 1): Promise<Page | null> {
  try {
    const data = await payloadFetch<PaginatedDocs<Page>>('pages', {
      depth,
      limit: 1,
      where: { slug: { equals: slug } },
    })
    return data.docs[0] ?? null
  } catch (error) {
    warnUnavailable(error)
    return null
  }
}
