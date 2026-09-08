import type { APIRoute } from 'astro'
import {
  badRequest,
  jsonResponse,
  parseQuantity,
  readCartFields,
  redirectToCart,
  wantsJson,
} from '../../../lib/cart-http'
import { addCartLine } from '../../../lib/shopify/cart'

/**
 * POST /api/cart/add — { variantId, quantity }
 *
 * The private Storefront token lives on this side of the wire. The browser
 * posts a variant id and nothing else; it never holds a cart id or a token.
 */
export const POST: APIRoute = async (context) => {
  const fields = await readCartFields(context.request)
  const variantId = fields.variantId?.trim()

  if (!variantId) {
    return badRequest('Missing variantId.', context.request)
  }

  // The id is a Shopify gid, and it goes straight into a GraphQL variable.
  // Reject anything that is not one rather than forwarding arbitrary strings.
  if (!variantId.startsWith('gid://shopify/ProductVariant/')) {
    return badRequest('Invalid variantId.', context.request)
  }

  const result = await addCartLine(context, {
    merchandiseId: variantId,
    quantity: parseQuantity(fields.quantity, 1),
  })

  return wantsJson(context.request) ? jsonResponse(result) : redirectToCart(result)
}
