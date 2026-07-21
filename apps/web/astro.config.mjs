import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'

// Full static site generation — deployed to Cloudflare Pages.
// Set PUBLIC_SITE_URL in your environment (Cloudflare Pages project settings
// for production, .env locally) so canonical URLs / sitemap / OG tags are
// correct for each environment.
const siteUrl = process.env.PUBLIC_SITE_URL || 'https://example.com'

export default defineConfig({
  site: siteUrl,
  output: 'static',
  integrations: [sitemap()],
})
