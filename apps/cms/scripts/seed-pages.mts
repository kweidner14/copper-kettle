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

const aboutContent = root([
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
])

// Written for the demo as it actually behaves, not as boilerplate: Copper
// Kettle is fictional, so the policy says so and describes what this codebase
// really stores.
const privacyContent = root([
  paragraph(
    'Copper Kettle is a fictional roaster. This site is a demonstration store built by CopperFox Labs, and nothing on it is for sale. This page describes what the demo actually does with your data.',
  ),
  heading('h2', 'Your cart'),
  paragraph(
    'When you add something to the cart, the site sets one cookie holding the id of your Shopify cart. It is httpOnly, so scripts on the page cannot read it, and it expires after 30 days. The cart contents themselves live with Shopify.',
  ),
  heading('h2', 'Checkout'),
  paragraph(
    "Checkout happens on Shopify, not on this site. The store is a Shopify development store, which can only place test orders, so no payment is ever taken. Anything you enter there is handled under Shopify's own privacy policy.",
  ),
  heading('h2', 'Contact and newsletter forms'),
  paragraph(
    "Messages and email addresses sent through these forms are stored in the site's content management system so the demo can show them arriving. They are not sold, shared or used to send marketing.",
  ),
  heading('h2', 'Analytics'),
  paragraph(
    'If analytics is enabled, Google Analytics loads only after you first scroll, move the mouse, press a key or touch the screen. Nothing is loaded on the initial page view.',
  ),
  heading('h2', 'Questions'),
  paragraph('Use the contact form and we will get back to you.'),
])

const pages = [
  {
    title: 'About',
    slug: 'about',
    content: aboutContent,
    seo: {
      metaTitle: 'About Copper Kettle Coffee Roasters',
      metaDescription:
        'A small Ozarks roastery buying one lot at a time and roasting the week it ships.',
    },
  },
  {
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    content: privacyContent,
    seo: {
      metaTitle: 'Privacy Policy | Copper Kettle',
      metaDescription: 'What this demo store stores about you, and where it goes.',
    },
  },
]

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
