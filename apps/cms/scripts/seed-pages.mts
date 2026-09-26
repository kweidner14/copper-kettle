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

// Tongue in cheek on purpose. The About page is where a real shop tells its
// origin story; a demo store's honest origin story is that it is a demo.
const aboutContent = root([
  paragraph(
    'Copper Kettle is not a real coffee roaster. There is no garage, no five kilo roaster and no spreadsheet of failed batches. There is a Shopify development store, a code editor and a frankly unreasonable amount of time spent on one checkout button.',
  ),
  heading('h2', 'What we sell'),
  paragraph(
    'Nothing. The products are real in the sense that Shopify keeps them in a database, and fake in every sense that matters to your letterbox. Add as much as you like. The cart is real, the prices are real, and the coffee will never arrive.',
  ),
  heading('h2', 'How we roast'),
  paragraph(
    'We do not. We roast code. Product pages are rendered fresh on every request, so the stock count never lies to you, which is more integrity than most real roasters can claim about their tasting notes.',
  ),
  heading('h2', 'About that password'),
  paragraph(
    'Yes, the store has a password. No, it is not a security feature. Shopify will not let a development store take its password page down, so we print it in the banner at the top of every page, which is roughly as secure as a sticky note on a monitor. It is coffee. It was always going to be coffee.',
  ),
  heading('h2', 'Why this exists'),
  paragraph(
    'So CopperFox Labs can show what a headless Shopify storefront looks like when somebody actually cares: fast pages, a cart that still works with JavaScript switched off, and a variant picker that does not need a framework to change a bag size. A fictional roaster was cheaper than a real client, and far less likely to ask for a carousel.',
  ),
  heading('h2', 'Visit'),
  paragraph(
    'Please do not. The roastery address on the contact page is made up. If it turns out to be real, we apologise to whoever lives there, and no, they will not grind your beans.',
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
      metaTitle: 'About Copper Kettle, which is not real',
      metaDescription:
        'Copper Kettle is a demo store built by CopperFox Labs. The coffee is fictional. The storefront is not.',
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
