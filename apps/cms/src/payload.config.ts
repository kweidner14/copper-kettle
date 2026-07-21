import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'

import { Users } from './collections/Users'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { ContactSubmissions } from './collections/ContactSubmissions'
import { NewsletterSubscribers } from './collections/NewsletterSubscribers'
import { contactEndpoint } from './endpoints/contact'
import { newsletterEndpoint } from './endpoints/newsletter'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// The .env.example S3 values are placeholders (e.g. an endpoint containing
// literal `<account-id>`), which fail URL parsing before the app even gets
// to boot. Only wire up the plugin once real R2/S3 credentials are set, so
// a fresh clone still runs locally (Media just uses local disk until then).
const s3Configured = [
  process.env.S3_BUCKET,
  process.env.S3_ENDPOINT,
  process.env.S3_ACCESS_KEY_ID,
  process.env.S3_SECRET_ACCESS_KEY,
].every((value) => Boolean(value) && !value?.includes('<') && value !== 'replace-me')

// Production/staging should always point DATABASE_URI at Postgres (per the
// project's stated stack). A `file:` URI is a local-only escape hatch for
// running this starter without standing up a real Postgres instance first.
const databaseUri = process.env.DATABASE_URI ?? ''
const db = databaseUri.startsWith('file:')
  ? sqliteAdapter({ client: { url: databaseUri } })
  : postgresAdapter({ pool: { connectionString: databaseUri } })

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  admin: {
    user: Users.slug,
  },
  editor: lexicalEditor(),
  collections: [Users, Pages, Posts, Categories, Media, ContactSubmissions, NewsletterSubscribers],
  endpoints: [contactEndpoint, newsletterEndpoint],
  secret: process.env.PAYLOAD_SECRET ?? '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  cors: (process.env.CORS_ORIGINS ?? '').split(',').filter(Boolean),
  csrf: (process.env.CORS_ORIGINS ?? '').split(',').filter(Boolean),
  db,
  sharp,
  plugins: s3Configured
    ? [
        s3Storage({
          collections: {
            media: true,
          },
          bucket: process.env.S3_BUCKET ?? '',
          config: {
            region: process.env.S3_REGION ?? 'auto',
            endpoint: process.env.S3_ENDPOINT,
            credentials: {
              accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
              secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
            },
            forcePathStyle: true,
          },
        }),
      ]
    : [],
})
