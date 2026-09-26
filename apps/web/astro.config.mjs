import cloudflare from '@astrojs/cloudflare'
import sitemap from '@astrojs/sitemap'
import svelte from '@astrojs/svelte'
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

  // Svelte is the only client framework in the project, and it exists for one
  // component: the cart drawer. Everything else — including the variant picker —
  // is server-rendered links and forms.
  integrations: [
    sitemap({
      // Per-visitor pages. robots.txt disallows them too.
      filter: (page) => !/\/(cart|checkout)\/?$/.test(new URL(page).pathname),
      // Product and collection pages are SSR with dynamic handles, which this
      // integration cannot enumerate. That endpoint lists them from the live
      // catalogue — see src/pages/sitemap-shop.xml.ts.
      customSitemaps: [new URL('/sitemap-shop.xml', siteUrl).toString()],
    }),
    svelte(),
  ],

  // Cold-start fix, not a performance tweak.
  //
  // @astrojs/cloudflare pre-optimises an explicit allowlist of server deps so
  // the SSR optimiser never has to discover one mid-flight. Anything it misses
  // gets found late, which triggers a re-optimise and a "program reload" while
  // the workerd runner is still holding the old "?v=<hash>" handles — the server
  // then dies with "The file does not exist at .../deps_ssr/...". A second
  // "npm run dev" succeeds only because the cache is already warm.
  //
  // Two entries are missing from that allowlist:
  //   - astro/logger/console — the adapter includes astro/logger/json but not
  //     the console logger, so this only bites in a normal terminal.
  //   - @astrojs/svelte/server.js — the renderer entry, resolved the first time
  //     a Svelte island is server-rendered.
  //
  // The adapter merges this top-level list into its own. Note that the older
  // "vite.ssr.optimizeDeps" key is NOT read here; it has to be top level.
  vite: {
    optimizeDeps: {
      include: ['astro/logger/console', '@astrojs/svelte/server.js'],
    },
  },

  // Typed, validated environment. The Storefront token is declared
  // `context: 'server', access: 'secret'`, which makes importing it from
  // client-side code a build error rather than a leak — see src/lib/shopify/client.ts.
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
      // Set only while the store is a Partner development store, which cannot
      // turn its password page off. When set, /checkout shows an unlock step
      // before handing off and the demo banner prints it; when empty, /checkout
      // redirects straight to Shopify. The value lives in wrangler.jsonc, and
      // deleting it there retires the workaround, so moving to a paid plan
      // needs no code change.
      SHOPIFY_STORE_PASSWORD: envField.string({
        context: 'server',
        access: 'public',
        optional: true,
        default: '',
      }),
      SHOPIFY_STOREFRONT_PRIVATE_TOKEN: envField.string({
        context: 'server',
        access: 'secret',
      }),
    },
  },
})
