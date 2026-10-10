# Copper Kettle

A headless Shopify storefront for a fictional coffee roaster, built by
[CopperFox Labs](https://copperfoxlabs.com) as a demo. Nothing here is for sale:
the store behind it is a Shopify development store, which can only place test
orders.

```
apps/
  web/   Astro 7 storefront: SSR on Cloudflare Workers, Shopify Storefront API
  cms/   Payload CMS 3 (Next.js host): the About and Privacy pages, plus the
         contact and newsletter form endpoints
```

Shopify owns the catalogue, the cart and checkout. Payload owns the editorial
pages. The storefront runs without Payload; the content pages just render
without their CMS copy.

## Running it locally

Needs Node 18.20+ and access to the Copper Kettle development store's
Storefront API token.

```bash
npm install
```

**CMS** (optional, but the About and Privacy pages are empty without it):

```bash
cd apps/cms
cp .env.example .env        # set DATABASE_URI=file:./dev.db for SQLite, and a PAYLOAD_SECRET
npm run dev                 # http://localhost:3000/admin
npm run seed:pages          # publishes the About and Privacy Policy pages
```

Add `http://localhost:4321` to `CORS_ORIGINS` so the storefront's forms can
post to it.

**Storefront**:

```bash
cd apps/web
cp .dev.vars.example .dev.vars   # paste the Storefront private access token
cp .env.example .env             # PAYLOAD_API_URL=http://localhost:3000
npm run dev                      # http://localhost:4321
```

## How the storefront works

**Rendering.** `output: 'server'`, so product, collection and cart pages are
rendered per request and stock is never stale. The home, About, Privacy and
Contact pages opt back into prerendering because they change on a publishing
schedule, not per visitor.

**Shopify access.** Everything goes through the Storefront API with the
*private* token, from server code only. The token is declared
`access: 'secret'` in `astro:env`, so importing it into client code fails the
build. Every call carries `Shopify-Storefront-Buyer-IP` (see
`src/lib/shopify/api.ts`), which is what keeps server-side traffic from being
throttled as a single buyer. Types come from `npm run codegen` against the
`#graphql` documents in `src/lib/shopify/queries`.

**Cart.** The cart lives on Shopify. The site keeps only its id, in an
httpOnly cookie, and every change goes through `/api/cart/*` endpoints. The
add-to-cart button is a real form post that works without JavaScript;
`src/scripts/cart.ts` upgrades it to an in-place add that opens the drawer.

**Search and sort.** `/search` runs the Storefront API's product search
per request and has shareable URLs (`/search?q=press&sort=price-asc`). The
catalogue and collection pages sort through the same short `?sort=` values,
mapped to each API's own sort enum in `src/lib/shopify/sort.ts`. Both are
plain GET forms, so they work without JavaScript, and pagination links carry
the query and sort with the cursor.

**Images.** Shopify's CDN resizes on a `width` parameter, so every image asks
for the size it renders at, with a `srcset` and a `sizes` derived from its
grid (`src/lib/shopify/image.ts`).

**The receipt.** The home page ends with a printed receipt for the visit:
HTML, JavaScript, font and image weight, time to first byte, largest paint and
layout shift, measured in the visitor's browser from the Performance API, next
to the Storefront API and CMS timings taken during the build. One small script
fills it in when the browser is idle after load
(`src/components/Receipt.astro`).

**JavaScript.** One Svelte island, the cart drawer. The variant picker is
server-rendered links, and the product gallery is links to the full-size
images that a small script turns into an in-place swap.

**Checkout.** A redirect to the cart's `checkoutUrl`, through `/checkout`. A
Partner development store cannot turn its password page off, and that page
swallows the first checkout request, so `/checkout` asks the visitor to unlock
the store first. The password (`coffee`) is set in `wrangler.jsonc` and printed
in the demo banner. Deleting `SHOPIFY_STORE_PASSWORD` there turns `/checkout`
into a straight redirect, with no code change.

**SEO.** Canonical URLs on every page (variant URLs canonicalise to the bare
product), Open Graph with a default card image, Product structured data on
product pages, a generated `robots.txt`, and a sitemap index that includes a
live `sitemap-shop.xml` for products and collections.

**Front end conventions.** SCSS with BEM, design tokens in
`src/styles/_variables.scss`, the `respond-to(sm|md|lg|xl)` mixin for
breakpoints. GA4 loads on first interaction rather than page load, and only if
`PUBLIC_GA4_ID` is set. Scroll-reveal animation is off under
`prefers-reduced-motion`.

## Configuration

| Where | What |
| --- | --- |
| `apps/web/wrangler.jsonc` | Store domain, API version, store password. Committed, not secret. |
| `apps/web/.dev.vars` | `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` for local dev. Gitignored. |
| `apps/web/.env` | `PAYLOAD_API_URL`, `PUBLIC_PAYLOAD_API_URL`, `PUBLIC_SITE_URL`, `PUBLIC_GA4_ID`. |
| `apps/cms/.env` | Database, Payload secret, CORS origins, optional R2 media storage and rebuild webhook. |

## The CMS

Collections: **Pages** (slug, Lexical rich text, SEO group, drafts),
**Media**, **Users**, and the write-only **ContactSubmissions** and
**NewsletterSubscribers**, which are filled by `POST /api/contact` and
`POST /api/newsletter`.

`src/hooks/triggerRebuild.ts` calls `REBUILD_WEBHOOK_URL` whenever a Page is
published, because the pages that read Payload are prerendered and only pick
up edits from a fresh build.

The About and Privacy copy lives in `content/pages.json`. `npm run seed:pages`
publishes it to Payload, and the storefront falls back to the same file when
Payload is unreachable at build time, so those pages are never empty.

Rich text is rendered by `apps/web/src/components/RichText.astro`, a small
Lexical-to-HTML serializer, so the storefront does not need React.

SQLite (`DATABASE_URI=file:...`) is for local development. Anywhere shared
should use Postgres; see [apps/cms/README.md](apps/cms/README.md).

## Checks

`.github/workflows/ci.yml` runs on pushes to `main` and on pull requests:
`astro check` and a production build for the storefront, ESLint and `tsc` for
the CMS. The build needs the Storefront token as a repository secret named
`SHOPIFY_STOREFRONT_PRIVATE_TOKEN`; without it (a pull request from a fork,
say) the build step is skipped with a notice rather than failing.

Locally:

```bash
npm run lint -w apps/web        # astro check
npm run build -w apps/web
npm run lint -w apps/cms        # eslint
npm run typecheck -w apps/cms   # tsc
```

## Deploying

The storefront deploys to Cloudflare Workers with static assets. A dry run
(`npx wrangler deploy --dry-run` in `apps/web`, after a build) packages it at
about 190 KB gzipped, with no bindings beyond the static assets and the three
variables in `wrangler.jsonc`.

```bash
cd apps/web
npx wrangler login
npx wrangler secret put SHOPIFY_STOREFRONT_PRIVATE_TOKEN   # paste the private token
npm run build
npx wrangler deploy
```

Then, in the Cloudflare dashboard, add the custom domain
(`copperkettle.copperfoxlabs.dev`) to the Worker. `PUBLIC_SITE_URL` in the
build environment should match it, since canonicals, the sitemap and
robots.txt are built from it.

Before sharing the link:

- In Shopify admin, confirm the store password is `coffee` (it must match
  `SHOPIFY_STORE_PASSWORD`) and switch on the Bogus Gateway for test orders.
  Then set `"SHOPIFY_TEST_CARD": "1"` in `wrangler.jsonc` so `/checkout` tells
  visitors which card to use.
- Decide on Payload. Without it, About and Privacy use the bundled copy in
  `content/pages.json`, but the contact and newsletter forms have nowhere to
  post. Hosting it means Railway (or similar) with Postgres; see
  [apps/cms/README.md](apps/cms/README.md), and set `PAYLOAD_API_URL` and
  `PUBLIC_PAYLOAD_API_URL` for the build.
