import type { APIRoute } from 'astro'

// Generated rather than kept in public/ because the Sitemap line must be an
// absolute URL (crawlers ignore a relative one), and the host comes from
// `site` in astro.config.mjs.
export const prerender = true

export const GET: APIRoute = ({ site }) => {
  const sitemapUrl = new URL('/sitemap-index.xml', site).toString()

  const body = [
    'User-agent: *',
    // Per-visitor pages and JSON endpoints; nothing here belongs in an index.
    'Disallow: /cart',
    'Disallow: /checkout',
    'Disallow: /api/',
    'Disallow: /search',
    '',
    `Sitemap: ${sitemapUrl}`,
    '',
  ].join('\n')

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
