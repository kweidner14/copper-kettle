/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PAYLOAD_API_URL: string
  readonly PUBLIC_SITE_URL: string
  readonly PUBLIC_GA4_ID: string
  readonly PUBLIC_PAYLOAD_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
