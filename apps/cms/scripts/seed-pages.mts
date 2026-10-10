/**
 * Seeds the content pages the storefront reads from Payload: About and
 * Privacy Policy.
 *
 * Uses Payload's Local API rather than REST because `create` on Pages is
 * authenticated-only, and this needs to run before anyone has made an admin
 * user. `overrideAccess: true` is what lets it skip that check; it is safe here
 * because the script runs on the machine that owns the database, not over the
 * wire.
 *
 * Idempotent: re-running updates the existing document instead of tripping the
 * unique constraint on `slug`.
 *
 * Run with:  npm run seed:pages -w apps/cms
 */
import { readFileSync } from 'node:fs'
import { getPayload } from 'payload'
import config from '../src/payload.config.js'

/** Lexical text node. Payload rejects rich text that omits these defaults. */
const text = (value: string) => ({
  type: 'text',
  text: value,
  version: 1,
  format: 0,
  detail: 0,
  mode: 'normal',
  style: '',
})

const paragraph = (value: string) => ({
  type: 'paragraph',
  version: 1,
  format: '',
  indent: 0,
  direction: 'ltr' as const,
  textFormat: 0,
  children: [text(value)],
})

const heading = (tag: 'h2' | 'h3', value: string) => ({
  type: 'heading',
  tag,
  version: 1,
  format: '',
  indent: 0,
  direction: 'ltr' as const,
  children: [text(value)],
})

const root = (children: object[]) => ({
  root: {
    type: 'root',
    version: 1,
    format: '',
    indent: 0,
    direction: 'ltr' as const,
    children,
  },
})

// The copy itself lives in content/pages.json at the repository root, shared
// with the storefront, which falls back to it when Payload is unreachable.
// This turns each block into the Lexical nodes Payload stores.
interface Block {
  type: 'paragraph' | 'heading'
  tag?: 'h2' | 'h3'
  text: string
}

interface PageSource {
  slug: string
  title: string
  seo: { metaTitle: string; metaDescription: string }
  blocks: Block[]
}

const sources = JSON.parse(
  readFileSync(new URL('../../../content/pages.json', import.meta.url), 'utf8'),
) as PageSource[]

const pages = sources.map(({ slug, title, seo, blocks }) => ({
  slug,
  title,
  seo,
  content: root(
    blocks.map((block) =>
      block.type === 'heading' ? heading(block.tag ?? 'h2', block.text) : paragraph(block.text),
    ),
  ),
}))

const payload = await getPayload({ config })

for (const page of pages) {
  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: page.slug } },
    limit: 1,
    overrideAccess: true,
  })

  // Drafts are enabled on this collection, and public reads are filtered to
  // published documents. Without this the storefront would fetch nothing.
  const data = { ...page, _status: 'published' as const }

  if (existing.docs.length > 0) {
    const doc = existing.docs[0]!
    await payload.update({ collection: 'pages', id: doc.id, data, overrideAccess: true })
    console.log(`Updated ${page.title} (id ${doc.id})`)
  } else {
    const created = await payload.create({ collection: 'pages', data, overrideAccess: true })
    console.log(`Created ${page.title} (id ${created.id})`)
  }
}

process.exit(0)
