import type { PaginatedDocs, Page } from './types'

// Read at build time (Astro SSG), so this must be the server-reachable URL
// for Payload, not necessarily the same as the public browser-facing one.
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

export async function getPages(depth = 1): Promise<Page[]> {
  const data = await payloadFetch<PaginatedDocs<Page>>('pages', { depth, limit: 100 })
  return data.docs
}

export async function getPage(slug: string, depth = 1): Promise<Page | null> {
  const data = await payloadFetch<PaginatedDocs<Page>>('pages', {
    depth,
    limit: 1,
    where: { slug: { equals: slug } },
  })
  return data.docs[0] ?? null
}
