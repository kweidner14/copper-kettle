import type { APIRoute } from 'astro'
import { createShopifyApi } from '../lib/shopify/api'

/**
 * GET /sitemap-shop.xml — every product and collection URL.
 *
 * @astrojs/sitemap only sees routes it can enumerate at build time, and the
 * product and collection pages are SSR with dynamic handles, so it cannot list
 * them. This fills that gap from the live catalogue and is referenced from
 * sitemap-index.xml through `customSitemaps` in astro.config.mjs.
 */

// The Storefront API caps a page at 250. Twenty pages is 5,000 products, far
// past this catalogue, and bounds the request if pagination ever misbehaves.
const PAGE_SIZE = 250
const MAX_PAGES = 20

export const GET: APIRoute = async (context) => {
  const shopify = createShopifyApi(context)
  const siteUrl = context.site?.toString().replace(/\/$/, '') ?? context.url.origin

  const productHandles: string[] = []
  let after: string | undefined

  for (let page = 0; page < MAX_PAGES; page++) {
    const { products, pageInfo } = await shopify.getProducts({ first: PAGE_SIZE, after })
    productHandles.push(...products.map((product) => product.handle))
    if (!pageInfo.hasNextPage || !pageInfo.endCursor) break
    after = pageInfo.endCursor
  }

  const collections = await shopify.getCollections(PAGE_SIZE)

  const urls = [
    ...productHandles.map((handle) => `${siteUrl}/products/${handle}`),
    ...collections.map((collection) => `${siteUrl}/collections/${collection.handle}`),
  ]

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`),
    '</urlset>',
  ].join('\n')

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // Crawlers do not need this per request; an hour keeps it close to the
      // catalogue without hitting the Storefront API on every fetch.
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
