import type { AstroCookies } from 'astro'
import { getBuyerIp, storefront } from './client'
import {
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_QUERY,
} from './queries/cart'
import type {
  CartCreateMutation,
  CartCreateMutationVariables,
  CartFieldsFragment,
  CartLinesAddMutation,
  CartLinesAddMutationVariables,
  CartLinesRemoveMutation,
  CartLinesRemoveMutationVariables,
  CartLinesUpdateMutation,
  CartLinesUpdateMutationVariables,
  CartQuery,
  CartQueryVariables,
} from './types/storefront.generated'

/**
 * Cart state and mutations.
 *
 * The cart lives entirely on Shopify. All this layer owns is the *pointer* to
 * it — a cart id in an httpOnly cookie — plus the rules for keeping that pointer
 * honest. The browser never sees the id and never talks to Shopify: every
 * mutation goes through an Astro endpoint that holds the private token.
 *
 * Checkout is a redirect to `cart.checkoutUrl`. There is no checkoutCreate any
 * more; the Cart object replaced Checkout in API 2026-01.
 */

export type Cart = CartFieldsFragment
export type CartLine = Cart['lines']['nodes'][number]

export const CART_COOKIE = 'cartId'

/**
 * httpOnly so a stray script cannot read the cart id, sameSite=lax so the cookie
 * still rides along on the top-level GET that returns from Shopify's checkout.
 * `secure` is off in dev only because local dev is http://localhost.
 */
const CART_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: import.meta.env.PROD,
  sameSite: 'lax',
  path: '/',
  maxAge: 60 * 60 * 24 * 30,
} as const

/** Structurally satisfied by both `Astro` and an `APIContext`. */
export interface CartContext {
  request: Request
  cookies: AstroCookies
  clientAddress?: string
  locals?: { __cart?: Cart | null }
}

/**
 * Per-request cart, fetched at most once.
 *
 * This deliberately does NOT live in `src/middleware.ts`. On Astro 7 with
 * @astrojs/cloudflare, the mere existence of a middleware file makes every
 * prerendered route fail in dev with "Unexpectedly unable to find a component
 * instance for route /" — an empty pass-through middleware does it too, so it
 * is not about what the middleware does. Production builds are unaffected, but
 * a dev server that cannot render the home page is not worth the tidiness.
 *
 * Memoising on `locals` keeps the behaviour middleware would have given us:
 * the layout and the page can both ask for the cart and only one Storefront
 * request goes out. On a prerendered route this runs at build time, where there
 * is no cookie, so it returns null without making a request at all.
 */
export async function resolveCart(context: CartContext): Promise<Cart | null> {
  const locals = context.locals

  // `in` rather than a truthiness check: a resolved-but-empty cart is null, and
  // that null is a real answer worth caching, not a cache miss.
  if (locals && '__cart' in locals) {
    return locals.__cart ?? null
  }

  const cart = await getCart(context)
  if (locals) locals.__cart = cart
  return cart
}

export interface CartUserError {
  code?: string | null
  field?: string[] | null
  message: string
}

export interface CartWarning {
  code: string
  message: string
  target: string
}

export interface CartResult {
  cart: Cart | null
  userErrors: CartUserError[]
  warnings: CartWarning[]
}

function call<TData, TVariables>(context: CartContext, query: string, variables: TVariables) {
  return storefront<TData, TVariables>(query, {
    variables,
    buyerIp: getBuyerIp(context),
  })
}

function setCartCookie(context: CartContext, cartId: string): void {
  context.cookies.set(CART_COOKIE, cartId, CART_COOKIE_OPTIONS)
}

export function clearCartCookie(context: CartContext): void {
  context.cookies.delete(CART_COOKIE, { path: '/' })
}

export function getCartId(context: CartContext): string | undefined {
  return context.cookies.get(CART_COOKIE)?.value || undefined
}

/**
 * Reads the current cart, or null when there isn't one.
 *
 * A stored id goes stale in normal use — carts expire, and completing checkout
 * retires the one that was bought. Shopify answers `cart(id:)` with null rather
 * than an error in those cases, so null is treated as "start over": drop the
 * cookie so the next add creates a fresh cart instead of failing forever
 * against an id that will never resolve again.
 */
export async function getCart(context: CartContext): Promise<Cart | null> {
  const cartId = getCartId(context)
  if (!cartId) return null

  try {
    const data = await call<CartQuery, CartQueryVariables>(context, CART_QUERY, { cartId })

    if (!data.cart) {
      clearCartCookie(context)
      return null
    }

    return data.cart
  } catch (error) {
    // A malformed or foreign cart id throws rather than returning null. Same
    // remedy: forget it, so one bad cookie does not wedge the whole session.
    clearCartCookie(context)
    console.error('[cart] failed to load cart, cookie cleared', error)
    return null
  }
}

/** Normalises a mutation payload and persists the cart id when one comes back. */
function toResult(
  context: CartContext,
  payload: {
    cart?: Cart | null
    userErrors: CartUserError[]
    warnings?: CartWarning[]
  } | null,
): CartResult {
  const cart = payload?.cart ?? null
  if (cart) setCartCookie(context, cart.id)

  return {
    cart,
    userErrors: payload?.userErrors ?? [],
    warnings: payload?.warnings ?? [],
  }
}

/**
 * Adds a variant, creating the cart on first add.
 *
 * `userErrors` is the important return value, not an afterthought: asking for
 * more than is in stock comes back as a 200 with a populated userErrors array
 * and an *unchanged* cart, so a caller that only checks for thrown errors will
 * silently report success.
 */
export async function addCartLine(
  context: CartContext,
  line: { merchandiseId: string; quantity: number },
): Promise<CartResult> {
  const cartId = getCartId(context)

  if (!cartId) {
    const data = await call<CartCreateMutation, CartCreateMutationVariables>(
      context,
      CART_CREATE_MUTATION,
      { input: { lines: [line] } },
    )
    return toResult(context, data.cartCreate ?? null)
  }

  const data = await call<CartLinesAddMutation, CartLinesAddMutationVariables>(
    context,
    CART_LINES_ADD_MUTATION,
    { cartId, lines: [line] },
  )

  // The cookie pointed at a cart Shopify no longer has. Drop it and retry once
  // as a create, so the customer's click still ends with the item in a cart.
  if (!data.cartLinesAdd?.cart) {
    clearCartCookie(context)
    const created = await call<CartCreateMutation, CartCreateMutationVariables>(
      context,
      CART_CREATE_MUTATION,
      { input: { lines: [line] } },
    )
    return toResult(context, created.cartCreate ?? null)
  }

  return toResult(context, data.cartLinesAdd)
}

/**
 * Sets a line's quantity. Zero or less removes it, because that is what a
 * quantity stepper stepping down from one means; `cartLinesUpdate` with
 * quantity 0 is not the documented way to delete a line.
 */
export async function setCartLineQuantity(
  context: CartContext,
  { lineId, quantity }: { lineId: string; quantity: number },
): Promise<CartResult> {
  const cartId = getCartId(context)
  if (!cartId) return { cart: null, userErrors: [], warnings: [] }

  if (quantity <= 0) {
    const data = await call<CartLinesRemoveMutation, CartLinesRemoveMutationVariables>(
      context,
      CART_LINES_REMOVE_MUTATION,
      { cartId, lineIds: [lineId] },
    )
    return toResult(context, data.cartLinesRemove ?? null)
  }

  const data = await call<CartLinesUpdateMutation, CartLinesUpdateMutationVariables>(
    context,
    CART_LINES_UPDATE_MUTATION,
    { cartId, lines: [{ id: lineId, quantity }] },
  )
  return toResult(context, data.cartLinesUpdate ?? null)
}
