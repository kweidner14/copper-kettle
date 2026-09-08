/**
 * Progressive enhancement for the add-to-cart form.
 *
 * Without this file the form still works: it posts url-encoded fields to
 * /api/cart/add and the endpoint 303s to /cart. This upgrades that to an
 * in-place add, then tells the drawer island to open via a custom event — which
 * is why the button needs no framework of its own and Svelte stays confined to
 * the one component that genuinely needs state.
 */
import type { Cart } from '../lib/shopify/cart'

interface CartEndpointResult {
  cart: Cart | null
  userErrors: { message: string }[]
  warnings: { message: string }[]
}

function announce(detail: { cart: Cart | null; notice?: string }): void {
  window.dispatchEvent(new CustomEvent('cart:updated', { detail }))
}

document.querySelectorAll<HTMLFormElement>('form[data-cart-add]').forEach((form) => {
  form.addEventListener('submit', async (event) => {
    event.preventDefault()

    const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]')
    const fields = Object.fromEntries(new FormData(form).entries())

    if (submit) submit.disabled = true

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })

      const result = (await response.json()) as CartEndpointResult
      // Warnings matter as much as errors here: an over-stock add succeeds and
      // reports the reduced quantity only in warnings.
      announce({
        cart: result.cart,
        notice: result.userErrors?.[0]?.message ?? result.warnings?.[0]?.message,
      })
    } catch {
      announce({ cart: null, notice: 'Could not reach the cart. Please try again.' })
    } finally {
      if (submit) submit.disabled = false
    }
  })
})
