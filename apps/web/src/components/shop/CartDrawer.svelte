<script lang="ts">
  import type { Cart } from '../../lib/shopify/cart'
  import { formatMoney } from '../../lib/shopify/money'
  import { formatWeight, totalGrams } from '../../lib/shopify/weight'

  /**
   * The project's single client island.
   *
   * It owns the trigger button as well as the panel, so the badge count and the
   * drawer can never disagree about what is in the cart.
   *
   * `initialCart` is whatever the server knew at render time. On an SSR route
   * that is the real cart and the badge is correct in the first paint. On a
   * prerendered route it is always null, so the component fetches /api/cart once
   * on mount to catch up.
   */
  let { initialCart = null }: { initialCart?: Cart | null } = $props()

  // Astro hands an island its props once at hydration and never updates them,
  // so reading the prop here as a one-time seed is deliberate rather than the
  // missed-reactivity bug Svelte is warning about.
  // svelte-ignore state_referenced_locally
  let cart = $state<Cart | null>(initialCart)
  let open = $state(false)
  let busy = $state(false)
  let notice = $state<string | null>(null)
  let panel = $state<HTMLElement | null>(null)

  const count = $derived(cart?.totalQuantity ?? 0)
  const lines = $derived(cart?.lines.nodes ?? [])

  /**
   * Weights arrive in whatever unit each variant was saved in — this catalog
   * mixes OUNCES and POUNDS on one product — so they are normalised to grams
   * before being summed. Adding the raw floats would silently under-count.
   */
  const weightLabel = $derived(
    formatWeight(
      totalGrams(
        lines.map((line) => ({
          weight: line.merchandise.weight,
          weightUnit: line.merchandise.weightUnit,
          quantity: line.quantity,
        })),
      ),
    ),
  )

  async function post(url: string, body: Record<string, unknown>) {
    busy = true
    notice = null
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const result = await response.json()

      // Shopify splits failure across two fields and neither is a GraphQL error.
      // `userErrors` is the outright rejection; `warnings` is the sneakier one —
      // asking for 999 of an item with 11 in stock *succeeds*, adds 11, and
      // reports the shortfall only here. Reading just userErrors would show the
      // customer a silent, quietly wrong quantity.
      notice = result.userErrors?.[0]?.message ?? result.warnings?.[0]?.message ?? null
      if (result.cart) cart = result.cart
    } catch {
      notice = 'Could not reach the cart. Please try again.'
    } finally {
      busy = false
    }
  }

  const setQuantity = (lineId: string, quantity: number) =>
    post('/api/cart/update', { lineId, quantity })

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && open) open = false
  }

  $effect(() => {
    // Prerendered pages render with cart: null regardless of the visitor, so
    // ask the server once the component is alive in the browser.
    if (initialCart === null) {
      fetch('/api/cart', { headers: { Accept: 'application/json' } })
        .then((response) => response.json())
        .then((result) => {
          if (result.cart) cart = result.cart
        })
        .catch(() => {})
    }

    // The PDP form posts through a plain script (see src/scripts/cart.ts) so the
    // add-to-cart button needs no framework of its own. It announces the result
    // here, which is what opens the drawer.
    const onUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ cart: Cart | null; notice?: string }>).detail
      if (detail?.cart) cart = detail.cart
      notice = detail?.notice ?? null
      open = true
    }

    window.addEventListener('cart:updated', onUpdated)
    return () => window.removeEventListener('cart:updated', onUpdated)
  })

  $effect(() => {
    // Stop the page behind the drawer from scrolling while it is open.
    document.body.style.overflow = open ? 'hidden' : ''
    if (open) panel?.focus()
    return () => {
      document.body.style.overflow = ''
    }
  })
</script>

<svelte:window on:keydown={onKeydown} />

<button
  class="cart-trigger"
  type="button"
  aria-haspopup="dialog"
  aria-expanded={open}
  onclick={() => (open = true)}
>
  Cart
  {#if count > 0}
    <span class="cart-trigger__count">{count}</span>
  {/if}
</button>

{#if open}
  <!-- Click-outside to dismiss. Escape is handled on window, and the panel
       itself is the labelled dialog, so this element stays presentational. -->
  <div
    class="cart-overlay"
    role="presentation"
    onclick={() => (open = false)}
  ></div>

  <div
    class="cart-panel"
    role="dialog"
    aria-modal="true"
    aria-label="Shopping cart"
    tabindex="-1"
    bind:this={panel}
  >
    <header class="cart-panel__header">
      <h2 class="cart-panel__title">Your cart</h2>
      <button class="cart-panel__close" type="button" onclick={() => (open = false)}>
        <span aria-hidden="true">&times;</span>
        <span class="visually-hidden">Close cart</span>
      </button>
    </header>

    {#if notice}
      <p class="cart-panel__notice" role="status">{notice}</p>
    {/if}

    {#if lines.length === 0}
      <p class="cart-panel__empty">Your cart is empty.</p>
    {:else}
      <ul class="cart-lines">
        {#each lines as line (line.id)}
          <li class="cart-line">
            {#if line.merchandise.image}
              <img
                class="cart-line__image"
                src={line.merchandise.image.url}
                alt={line.merchandise.image.altText ?? line.merchandise.product.title}
                width="64"
                height="64"
              />
            {:else}
              <div class="cart-line__image cart-line__image--placeholder"></div>
            {/if}

            <div class="cart-line__body">
              <a class="cart-line__title" href={`/products/${line.merchandise.product.handle}`}>
                {line.merchandise.product.title}
              </a>

              {#if line.merchandise.selectedOptions.length > 0}
                <p class="cart-line__options">
                  {line.merchandise.selectedOptions.map((o) => o.value).join(' / ')}
                </p>
              {/if}

              <div class="cart-line__controls">
                <div class="cart-qty">
                  <button
                    type="button"
                    disabled={busy}
                    aria-label="Decrease quantity"
                    onclick={() => setQuantity(line.id, line.quantity - 1)}
                  >
                    &minus;
                  </button>
                  <span class="cart-qty__value">{line.quantity}</span>
                  <button
                    type="button"
                    disabled={busy}
                    aria-label="Increase quantity"
                    onclick={() => setQuantity(line.id, line.quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <button
                  class="cart-line__remove"
                  type="button"
                  disabled={busy}
                  onclick={() => setQuantity(line.id, 0)}
                >
                  Remove
                </button>
              </div>
            </div>

            <span class="cart-line__price">{formatMoney(line.cost.totalAmount)}</span>
          </li>
        {/each}
      </ul>

      <footer class="cart-panel__footer">
        <div class="cart-panel__row">
          <span>Subtotal</span>
          <span>{formatMoney(cart!.cost.subtotalAmount)}</span>
        </div>

        {#if weightLabel}
          <div class="cart-panel__row cart-panel__row--muted">
            <span>Total weight</span>
            <span>{weightLabel}</span>
          </div>
        {/if}

        <p class="cart-panel__note">Shipping and taxes are calculated at checkout.</p>

        <a class="cart-panel__checkout" href={cart!.checkoutUrl} rel="nofollow">Checkout</a>
      </footer>
    {/if}
  </div>
{/if}

<style lang="scss">
  @use '../../styles/mixins' as mixins;
  @use '../../styles/variables' as vars;

  .visually-hidden {
    @include mixins.visually-hidden;
  }

  .cart-trigger {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.35rem 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    background: transparent;
    color: var(--color-text-muted);
    font: inherit;
    cursor: pointer;

    &:hover,
    &:focus-visible {
      color: var(--color-text);
    }

    &__count {
      display: inline-grid;
      place-items: center;
      min-width: 1.25rem;
      height: 1.25rem;
      padding-inline: 0.25rem;
      border-radius: 999px;
      background: var(--color-primary);
      color: var(--color-primary-contrast);
      font-size: 0.75rem;
      font-variant-numeric: tabular-nums;
    }
  }

  .cart-overlay {
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 60%);
    z-index: 200;
  }

  .cart-panel {
    position: fixed;
    inset-block: 0;
    inset-inline-end: 0;
    z-index: 201;
    display: flex;
    flex-direction: column;
    width: min(26rem, 100vw);
    background: var(--color-bg);
    border-inline-start: 1px solid var(--color-border);

    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: vars.$spacing-unit * 2;
      border-bottom: 1px solid var(--color-border);
    }

    &__title {
      margin: 0;
      font-size: 1.125rem;
    }

    &__close {
      border: 0;
      background: transparent;
      color: var(--color-text-muted);
      font-size: 1.5rem;
      line-height: 1;
      cursor: pointer;
    }

    &__notice {
      margin: vars.$spacing-unit * 2;
      padding: vars.$spacing-unit;
      border: 1px solid var(--color-border);
      border-radius: 6px;
      color: var(--color-text);
      font-size: 0.875rem;
    }

    &__empty {
      padding: vars.$spacing-unit * 3;
      color: var(--color-text-muted);
    }

    &__footer {
      margin-block-start: auto;
      padding: vars.$spacing-unit * 2;
      border-top: 1px solid var(--color-border);
      display: grid;
      gap: vars.$spacing-unit;
    }

    &__row {
      display: flex;
      justify-content: space-between;
      font-variant-numeric: tabular-nums;

      &--muted {
        color: var(--color-text-muted);
        font-size: 0.875rem;
      }
    }

    &__note {
      margin: 0;
      color: var(--color-text-muted);
      font-size: 0.8125rem;
    }

    &__checkout {
      display: block;
      padding: 0.875rem 1.25rem;
      border-radius: 6px;
      background: var(--color-primary);
      color: var(--color-primary-contrast);
      font-weight: 500;
      text-align: center;
      text-decoration: none;
    }
  }

  .cart-lines {
    flex: 1;
    overflow-y: auto;
    margin: 0;
    padding: vars.$spacing-unit * 2;
    list-style: none;
    display: grid;
    gap: vars.$spacing-unit * 2;
    align-content: start;
  }

  .cart-line {
    display: grid;
    grid-template-columns: 4rem 1fr auto;
    gap: vars.$spacing-unit;

    &__image {
      width: 4rem;
      height: 4rem;
      object-fit: cover;
      border: 1px solid var(--color-border);
      border-radius: 6px;

      &--placeholder {
        background: var(--color-surface);
      }
    }

    &__body {
      display: grid;
      gap: 0.25rem;
      align-content: start;
    }

    &__title {
      color: inherit;
      font-size: 0.9375rem;
      text-decoration: none;
    }

    &__options {
      margin: 0;
      color: var(--color-text-muted);
      font-size: 0.8125rem;
    }

    &__controls {
      display: flex;
      align-items: center;
      gap: vars.$spacing-unit;
      margin-block-start: 0.25rem;
    }

    &__remove {
      border: 0;
      background: transparent;
      color: var(--color-text-muted);
      font: inherit;
      font-size: 0.8125rem;
      text-decoration: underline;
      cursor: pointer;
    }

    &__price {
      font-size: 0.9375rem;
      font-variant-numeric: tabular-nums;
    }
  }

  .cart-qty {
    display: inline-flex;
    align-items: center;
    border: 1px solid var(--color-border);
    border-radius: 6px;

    button {
      width: 1.75rem;
      height: 1.75rem;
      border: 0;
      background: transparent;
      color: inherit;
      font: inherit;
      cursor: pointer;

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }

    &__value {
      min-width: 1.5rem;
      text-align: center;
      font-size: 0.875rem;
      font-variant-numeric: tabular-nums;
    }
  }
</style>
