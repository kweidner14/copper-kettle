/**
 * Seeds the About page.
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
 * Run with:  npm run seed:about -w apps/cms
 */
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

const content = {
  root: {
    type: 'root',
    version: 1,
    format: '',
    indent: 0,
    direction: 'ltr' as const,
    children: [
      paragraph(
        'Copper Kettle started in a garage in 2019 with a five kilo roaster and a spreadsheet of failed batches. We still keep the spreadsheet.',
      ),
      heading('h2', 'What we buy'),
      paragraph(
        'One or two lots at a time, from importers who will tell us the farm gate price without being asked twice. Small volumes mean we can turn a coffee down if the cup does not hold up, which is most of the argument for staying this size.',
      ),
      heading('h2', 'How we roast'),
      paragraph(
        'Everything is roasted the week it ships, in batches small enough that one person can taste every one. Nothing sits in a warehouse waiting for an order to arrive. The roast date goes on the bag because it is the number that actually matters.',
      ),
      heading('h2', 'Why the grind is on the bag'),
      paragraph(
        'Most roasters split one coffee into nine listings. We would rather sell you the coffee and let you pick the roast, grind and size on the product itself. It is fewer decisions for us and fewer dead ends for you.',
      ),
      heading('h2', 'Visit'),
      paragraph(
        'The roastery is open to anyone who wants to see a batch come off the drum. Bring a bag back and we will grind it for you.',
      ),
    ],
  },
}

const payload = await getPayload({ config })

const existing = await payload.find({
  collection: 'pages',
  where: { slug: { equals: 'about' } },
  limit: 1,
  overrideAccess: true,
})

const data = {
  title: 'About',
  slug: 'about',
  content,
  seo: {
    metaTitle: 'About Copper Kettle Coffee Roasters',
    metaDescription:
      'A small Ozarks roastery buying one lot at a time and roasting the week it ships.',
  },
  // Drafts are enabled on this collection, and public reads are filtered to
  // published documents. Without this the storefront would fetch nothing.
  _status: 'published' as const,
}

if (existing.docs.length > 0) {
  const doc = existing.docs[0]!
  await payload.update({ collection: 'pages', id: doc.id, data, overrideAccess: true })
  console.log(`Updated existing About page (id ${doc.id})`)
} else {
  const created = await payload.create({ collection: 'pages', data, overrideAccess: true })
  console.log(`Created About page (id ${created.id})`)
}

process.exit(0)
