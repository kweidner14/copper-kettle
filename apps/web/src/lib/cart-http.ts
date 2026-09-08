import type { CartResult } from './shopify/cart'

/**
 * Shared plumbing for the cart endpoints.
 *
 * Each endpoint answers two different callers with the same logic:
 *
 *   - the drawer island, which sends JSON and wants JSON back
 *   - a plain <form> with no JavaScript, which sends url-encoded fields and
 *     needs a redirect, or the customer is left staring at a JSON blob
 *
 * Keeping both paths on one code path is what makes the cart work without JS
 * rather than merely degrade politely.
 */

/** Reads fields from either a JSON body or a form post. */
export async function readCartFields(request: Request): Promise<Record<string, string>> {
  const contentType = request.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    const body = (await request.json()) as Record<string, unknown>
    return Object.fromEntries(
      Object.entries(body).map(([key, value]) => [key, String(value ?? '')]),
    )
  }

  const form = await request.formData()
  return Object.fromEntries([...form.entries()].map(([key, value]) => [key, String(value)]))
}

/**
 * True when the caller is scripted. Checked via the explicit Accept header the
 * island sends, not via `X-Requested-With` — a browser form post can carry
 * `application/json` in its Accept list too, so the JSON content-type is the
 * more reliable half of the signal.
 */
export function wantsJson(request: Request): boolean {
  const contentType = request.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) return true

  const accept = request.headers.get('accept') ?? ''
  return accept.includes('application/json') && !accept.includes('text/html')
}

/** Parses a quantity field, clamping anything unparseable to a safe default. */
export function parseQuantity(raw: string | undefined, fallback = 1): number {
  const parsed = Number.parseInt(raw ?? '', 10)
  if (!Number.isFinite(parsed)) return fallback
  // Shopify rejects absurd quantities anyway; cap here so a hand-crafted post
  // cannot turn one click into a 10,000-unit line.
  return Math.min(Math.max(parsed, 0), 999)
}

/**
 * The one message worth showing the customer, from either bucket.
 *
 * Shopify splits "that didn't work" across two fields, and the split is not
 * intuitive: asking for 999 of an item with 11 in stock is not a `userError` —
 * it succeeds, silently adds 11, and reports the shortfall as a `warning`
 * (MERCHANDISE_NOT_ENOUGH_STOCK). Reading only `userErrors` therefore looks
 * like a clean success while quietly giving the customer a different quantity
 * than they asked for.
 */
export function firstCartMessage(result: CartResult): string | undefined {
  return result.userErrors[0]?.message ?? result.warnings[0]?.message
}

export function jsonResponse(result: CartResult, status = 200): Response {
  return new Response(JSON.stringify(result), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * 303 rather than 302: the browser must switch to GET for the follow-up, or a
 * refresh on the cart page re-submits the mutation.
 */
export function redirectToCart(result: CartResult): Response {
  const message = firstCartMessage(result)
  const location = message ? `/cart?notice=${encodeURIComponent(message)}` : '/cart'

  return new Response(null, { status: 303, headers: { Location: location } })
}

export function badRequest(message: string, request: Request): Response {
  if (wantsJson(request)) {
    return jsonResponse({ cart: null, userErrors: [{ message }], warnings: [] }, 400)
  }
  return new Response(null, {
    status: 303,
    headers: { Location: `/cart?notice=${encodeURIComponent(message)}` },
  })
}
