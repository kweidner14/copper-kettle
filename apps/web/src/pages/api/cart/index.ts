import type { APIRoute } from 'astro'
import { jsonResponse } from '../../../lib/cart-http'
import { resolveCart } from '../../../lib/shopify/cart'

/**
 * GET /api/cart — current cart as JSON.
 *
 * How the drawer island learns the cart on a *prerendered* page, where the
 * server resolved the cart as null at build time and cannot know better.
 * Marked no-store so a shared cache never serves one visitor's cart to another.
 */
export const GET: APIRoute = async (context) => {
  const response = jsonResponse({
    cart: await resolveCart(context),
    userErrors: [],
    warnings: [],
  })

  response.headers.set('Cache-Control', 'private, no-store')
  return response
}
