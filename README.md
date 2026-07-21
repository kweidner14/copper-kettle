# Astro + Payload CMS 3 Starter

A minimal, opinionated starter/reference architecture — not a finished
production site. Two independently deployable apps in one repo:

```
apps/
  web/   Astro frontend — static site generation (SSG), deployed to Cloudflare Pages
  cms/   Payload CMS 3.x backend (Next.js host) — Postgres + S3/R2 media, deployed to Railway (or similar)
```

The two apps talk over Payload's REST API only. `apps/web` fetches content
at **build time**; there is no runtime dependency between them beyond the
rebuild webhook described below.

## Why two separate deploys

The frontend is fully static — no server, no SSR, just files on a CDN. That
means editors publishing content in Payload doesn't do anything on its own;
`apps/cms` has an `afterChange` hook (`apps/cms/src/hooks/triggerRebuild.ts`)
that calls a deploy webhook (e.g. a Cloudflare Pages deploy hook) the moment
a Page or Post is published, which kicks off a fresh Astro build.

## Getting started

```bash
npm install

# Terminal 1 — CMS
cd apps/cms && cp .env.example .env   # fill in DATABASE_URI, PAYLOAD_SECRET, S3_*
npm run dev                            # http://localhost:3000/admin

# Terminal 2 — frontend
cd apps/web && cp .env.example .env    # PAYLOAD_API_URL=http://localhost:3000
npm run dev                             # http://localhost:4321
```

Create your first admin user at `/admin`, then add Pages with slugs `home`,
`about`, `services`, `privacy-policy` (the frontend pages fall back to a
placeholder notice if a given slug doesn't exist yet, so nothing crashes on
a fresh install).

See [apps/cms/README.md](apps/cms/README.md) and the conventions below for
the rest.

## Conventions this starter follows

- **SCSS + BEM** — see `apps/web/src/styles/_mixins.scss` for the
  `respond-to(sm|md|lg|xl)` breakpoint mixin; component styles live
  co-located in each `.astro` file.
- **`lib/api.ts`** — the only place that talks to Payload's REST API from
  the frontend; every fetch uses Payload's `depth` param to control how far
  relationships/uploads get populated.
- **`RichText.astro`** — hand-rolled Lexical → HTML serializer (headings,
  lists, links, including resolving Payload's `linkType: internal` nodes via
  `fields.doc` rather than the possibly-stale `fields.url`). Payload doesn't
  ship an Astro renderer, so this exists instead of pulling React in.
- **Reusable `seo` field group** on every content collection
  (`apps/cms/src/fields/seo.ts`) — metaTitle, metaDescription, canonicalUrl,
  robots index/follow, OG/Twitter overrides.
- **GA4 loads lazily** on first user interaction (scroll/mousemove/keydown/
  touch), never on initial page load, to protect LCP — see
  `apps/web/src/scripts/analytics.ts`.
- **Scroll-reveal** via `[data-reveal]` + IntersectionObserver
  (`apps/web/src/scripts/reveal.ts`), opacity/transform only (no CLS), and
  fully disabled under `prefers-reduced-motion`.
- **Accessibility basics**: skip link, `.sr-only` utility, `aria-hidden` on
  decorative SVGs, one `<h1>` per page.

## Deploying

- **Frontend (Cloudflare Pages)**: build command `npm run build --workspace=apps/web`,
  output directory `apps/web/dist`. Set `PAYLOAD_API_URL`, `PUBLIC_SITE_URL`,
  `PUBLIC_PAYLOAD_API_URL`, and `PUBLIC_GA4_ID` in the Pages project's
  environment variables. Create a Pages deploy hook and put its URL in the
  CMS's `REBUILD_WEBHOOK_URL`.
- **Backend (Railway)**: see [apps/cms/README.md](apps/cms/README.md).

## Explicitly out of scope

Authentication flows beyond Payload's built-in CMS-user auth, e-commerce,
and anything not listed above — this is a starting point, add what your
project actually needs on top of it.
