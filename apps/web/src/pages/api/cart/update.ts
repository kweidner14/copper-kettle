import type { APIRoute } from 'astro'
import {
  badRequest,
  jsonResponse,
  parseQuantity,
  readCartFields,
  redirectToCart,
  wantsJson,
} from '../../../lib/cart-http'
import { setCartLineQuantity } from '../../../lib/shopify/cart'

/**
 * POST /api/cart/update — { lineId, quantity }
 *
 * Quantity 0 removes the line, so the quantity stepper and the remove button
 * are the same operation and cannot drift apart.
 */
export const POST: APIRoute = async (context) => {
  const fields = await readCartFields(context.request)
  const lineId = fields.lineId?.trim()

  if (!lineId) {
    return badRequest('Missing lineId.', context.request)
  }

  if (!lineId.startsWith('gid://shopify/CartLine/')) {
    return badRequest('Invalid lineId.', context.request)
  }

  const result = await setCartLineQuantity(context, {
    lineId,
    quantity: parseQuantity(fields.quantity, 0),
  })

  return wantsJson(context.request) ? jsonResponse(result) : redirectToCart(result)
}
