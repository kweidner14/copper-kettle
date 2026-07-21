import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Payload's admin UI and API routes live under src/app/(payload).
  // Everything else is intentionally left empty — this app is an API/admin
  // host only, the public site is the separate Astro app in apps/web.
}

export default withPayload(nextConfig, { configPath: './src/payload.config.ts' })
