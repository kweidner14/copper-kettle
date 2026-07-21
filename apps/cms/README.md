# apps/cms — Payload CMS 3.x backend

Payload 3 runs as a plugin inside a Next.js app. This app hosts **only** the
Payload admin UI (`/admin`) and REST/GraphQL API (`/api/*`) — there is no
public-facing frontend here, that's `apps/web` (Astro).

## Collections

- **Users** — CMS editors/admins (Payload's built-in auth).
- **Pages** — flat pages (About, Services, Privacy, etc.) with slug + Lexical rich text + SEO group.
- **Posts** — blog posts with category, featured image, excerpt, Lexical rich text + SEO group.
- **Categories** — simple taxonomy for Posts.
- **Media** — uploads collection, backed by S3-compatible storage (see below), not local disk.
- **ContactSubmissions** / **NewsletterSubscribers** — write-only via the custom endpoints below; not writable through the generic REST API directly.

Every content collection gets a reusable `seo` field group
(`src/fields/seo.ts`): metaTitle, metaDescription, canonicalUrl, robots
index/follow toggles, and OG/Twitter overrides.

## Custom endpoints

- `POST /api/contact` — validates name/email/message, writes to `contact-submissions`.
- `POST /api/newsletter` — validates email, writes to `newsletter-subscribers`.

Both are intentionally thin — swap the `payload.create(...)` calls for a
direct call to your email service / ESP (e.g. Beehiiv, Mailchimp) if you'd
rather not store submissions in Payload at all.

## Rebuild-on-publish

Since the frontend is a fully static Astro build, it has no way to know
content changed. `src/hooks/triggerRebuild.ts` is an `afterChange` hook on
Pages and Posts that POSTs to `REBUILD_WEBHOOK_URL` (e.g. a Cloudflare
Pages deploy hook) the moment a document transitions into `published`.

If you'd rather batch rebuilds on a schedule instead of firing one per
publish, replace this with a Payload [Jobs Queue](https://payloadcms.com/docs/jobs-queue/overview)
cron task that checks for anything published since the last run and fires
the same webhook — the hook file is a natural drop-in replacement point.

## Media storage

`@payloadcms/storage-s3` is configured in `payload.config.ts` for the
`media` collection, pointed at Cloudflare R2 (S3-compatible) via env vars —
see `.env.example`. Swap the `endpoint`/credentials for any other
S3-compatible provider without touching collection code.

## Local development

```bash
cp .env.example .env   # fill in DATABASE_URI, PAYLOAD_SECRET, S3_*, etc.
npm install
npm run dev             # http://localhost:3000/admin
```

First run against a fresh Postgres database will prompt you to create the
first admin user at `/admin`.

## Deploying (Railway)

1. Provision a Postgres database (Railway's Postgres plugin gives you `DATABASE_URI` automatically).
2. Set the remaining env vars from `.env.example` (`PAYLOAD_SECRET`, `S3_*`, `REBUILD_WEBHOOK_URL`, `CORS_ORIGINS` — include your Astro site's deployed URL).
3. Build command: `npm run build`. Start command: `npm run start`.
