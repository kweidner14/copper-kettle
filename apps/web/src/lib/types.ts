export interface Media {
  id: string
  url: string
  alt: string
  width?: number
  height?: number
}

export interface Seo {
  metaTitle?: string
  metaDescription?: string
  canonicalUrl?: string
  robotsIndex?: boolean
  robotsFollow?: boolean
  ogImage?: Media | string | null
  ogTitleOverride?: string
  ogDescriptionOverride?: string
}

// Payload Lexical rich text is a recursive JSON tree. This is intentionally
// loose (rather than modeling every node type) — RichText.astro narrows
// on `type` at render time. See src/components/RichText.astro.
export interface LexicalNode {
  type: string
  version?: number
  children?: LexicalNode[]
  text?: string
  format?: number | string
  tag?: string // heading level, e.g. "h2"
  listType?: 'bullet' | 'number'
  fields?: {
    linkType?: 'internal' | 'custom'
    url?: string
    newTab?: boolean
    doc?: {
      relationTo: string
      value: { slug?: string; id?: string } | string
    }
  }
  [key: string]: unknown
}

export interface RichTextContent {
  root: LexicalNode
}

export interface Page {
  id: string
  title: string
  slug: string
  content?: RichTextContent
  seo?: Seo
}

export interface PaginatedDocs<T> {
  docs: T[]
  totalDocs: number
  totalPages: number
  page: number
  hasNextPage: boolean
  hasPrevPage: boolean
}
