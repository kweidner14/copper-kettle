import cloudflare from '@astrojs/cloudflare'
import sitemap from '@astrojs/sitemap'
import { defineConfig, envField } from 'astro/config'

// Canonical public URL, used for canonical tags / sitemap / OG.
// Cloudflare Pages project settings in production, `.dev.vars` locally.
const siteUrl = process.env.PUBLIC_SITE_URL || 'https://copperkettle.copperfoxlabs.dev'

export default defineConfig({
  site: siteUrl,

  // SSR by default: stock levels and variant availability are read per request.
  // Static marketing pages opt back out with `export const prerender = true`.
  output: 'server',
  adapter: cloudflare(),

  integrations: [sitemap()],

  // Typed, validated environment. The Storefront token is declared
  // `context: 'server', access: 'secret'`, which makes importing it from
  // client-side code a build error rather than a leak.
  env: {
    schema: {
      SHOPIFY_STORE_DOMAIN: envField.string({
        context: 'server',
        access: 'public',
        default: 'copper-kettle-im1ju9t1.myshopify.com',
      }),
      SHOPIFY_STOREFRONT_API_VERSION: envField.string({
        context: 'server',
        access: 'public',
        default: '2026-04',
      }),
      SHOPIFY_STOREFRONT_PRIVATE_TOKEN: envField.string({
        context: 'server',
        access: 'secret',
      }),
    },
  },
})
