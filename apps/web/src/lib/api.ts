import bundledPages from '../../../../content/pages.json'
import type { LexicalNode, PaginatedDocs, Page } from './types'

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

// Payload is optional content, not a dependency of the storefront. An
// unreachable or failing CMS logs a warning instead of failing the whole build
// over an About page, and the pages it seeds fall back to the same copy
// bundled from content/pages.json, the file the CMS seed script reads.
let reachable = true

/** Whether the most recent Payload read succeeded. "No such page" still counts as reachable. */
export function payloadReachable(): boolean {
  return reachable
}

function warnUnavailable(error: unknown): void {
  reachable = false
  console.warn(`[payload] ${API_URL} unavailable, using bundled copy where there is one: ${String(error)}`)
}

interface BundledPage {
  slug: string
  title: string
  seo: { metaTitle: string; metaDescription: string }
  blocks: { type: string; tag?: string; text: string }[]
}

/** The repo's copy of a seeded page, in the Lexical shape RichText.astro renders. */
function bundledPage(slug: string): Page | null {
  const source = (bundledPages as BundledPage[]).find((page) => page.slug === slug)
  if (!source) return null
  const textNode = (text: string): LexicalNode => ({ type: 'text', text, format: 0 })
  return {
    id: `bundled-${slug}`,
    slug,
    title: source.title,
    seo: source.seo,
    content: {
      root: {
        type: 'root',
        children: source.blocks.map((block) =>
          block.type === 'heading'
            ? { type: 'heading', tag: block.tag ?? 'h2', children: [textNode(block.text)] }
            : { type: 'paragraph', children: [textNode(block.text)] },
        ),
      },
    },
  }
}

export async function getPages(depth = 1): Promise<Page[]> {
  try {
    const data = await payloadFetch<PaginatedDocs<Page>>('pages', { depth, limit: 100 })
    reachable = true
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
    reachable = true
    return data.docs[0] ?? null
  } catch (error) {
    warnUnavailable(error)
    return bundledPage(slug)
  }
}
