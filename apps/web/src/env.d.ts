/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    /** Per-request cart memo, filled by resolveCart(). Not set by middleware. */
    __cart?: import('./lib/shopify/cart').Cart | null
  }
}

interface ImportMetaEnv {
  readonly PAYLOAD_API_URL: string
  readonly PUBLIC_SITE_URL: string
  readonly PUBLIC_GA4_ID: string
  readonly PUBLIC_PAYLOAD_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
