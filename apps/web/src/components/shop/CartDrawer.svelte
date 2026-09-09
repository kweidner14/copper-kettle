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

  // Reads as a word with a count, not an icon with a bubble. Keeps the header
  // typographic all the way across.
  .cart-trigger {
    display: inline-flex;
    align-items: baseline;
    gap: 0.4rem;
    padding: 0.5rem 0.875rem;
    border: 1px solid var(--rule-strong);
    border-radius: 0;
    background: transparent;
    color: var(--ink);
    cursor: pointer;
    @include mixins.eyebrow;
    color: var(--ink);
    transition:
      border-color 0.2s ease,
      background-color 0.2s ease,
      color 0.2s ease;

    &:hover,
    &:focus-visible {
      border-color: var(--ink);
      background: var(--ink);
      color: var(--paper);
    }

    &__count {
      font-variant-numeric: tabular-nums;
      color: var(--copper);
      transition: color 0.2s ease;
    }

    &:hover &__count,
    &:focus-visible &__count {
      color: var(--paper);
    }
  }

  .cart-overlay {
    position: fixed;
    inset: 0;
    background: rgb(23 18 14 / 45%);
    backdrop-filter: blur(2px);
    z-index: 200;
  }

  .cart-panel {
    position: fixed;
    inset-block: 0;
    inset-inline-end: 0;
    z-index: 201;
    display: flex;
    flex-direction: column;
    width: min(27rem, 100vw);
    background: var(--paper-raised);
    border-inline-start: 1px solid var(--rule-strong);

    &__header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: vars.$spacing-unit;
      padding: vars.$spacing-unit * 3;
      border-block-end: 1px solid var(--rule);
    }

    &__title {
      margin: 0;
      font-family: vars.$font-display;
      font-size: 1.375rem;
      font-weight: 500;
    }

    &__close {
      border: 0;
      background: transparent;
      color: var(--ink-faint);
      font-size: 1.5rem;
      line-height: 1;
      cursor: pointer;
      transition: color 0.2s ease;

      &:hover,
      &:focus-visible {
        color: var(--ink);
      }
    }

    &__notice {
      margin: vars.$spacing-unit * 3 vars.$spacing-unit * 3 0;
      padding: 0.75rem 0.875rem;
      border-inline-start: 2px solid var(--copper);
      background: var(--paper-sunk);
      color: var(--ink);
      font-size: 0.875rem;
    }

    &__empty {
      padding: vars.$spacing-unit * 4 vars.$spacing-unit * 3;
      margin: 0;
      color: var(--ink-soft);
    }

    &__footer {
      margin-block-start: auto;
      padding: vars.$spacing-unit * 3;
      border-block-start: 1px solid var(--rule);
      display: grid;
      gap: 0.625rem;
    }

    &__row {
      display: flex;
      justify-content: space-between;
      font-variant-numeric: tabular-nums;
      font-size: 0.9375rem;

      &--muted {
        @include mixins.eyebrow;
      }
    }

    &__note {
      margin: 0.25rem 0 0.5rem;
      color: var(--ink-faint);
      font-size: 0.8125rem;
    }

    &__checkout {
      @include mixins.button-solid;
      width: 100%;
    }
  }

  .cart-lines {
    flex: 1;
    overflow-y: auto;
    margin: 0;
    padding: vars.$spacing-unit * 3;
    list-style: none;
    display: grid;
    gap: vars.$spacing-unit * 3;
    align-content: start;
  }

  .cart-line {
    display: grid;
    grid-template-columns: 4.5rem 1fr auto;
    gap: vars.$spacing-unit * 1.5;
    padding-block-end: vars.$spacing-unit * 3;
    border-block-end: 1px solid var(--rule);

    &:last-child {
      padding-block-end: 0;
      border-block-end: 0;
    }

    &__image {
      width: 4.5rem;
      height: 5.625rem;
      object-fit: cover;
      background: var(--paper-sunk);

      &--placeholder {
        background: var(--paper-sunk);
      }
    }

    &__body {
      display: grid;
      gap: 0.25rem;
      align-content: start;
    }

    &__title {
      font-family: vars.$font-display;
      font-size: 1rem;
      color: inherit;
      text-decoration: none;

      &:hover,
      &:focus-visible {
        color: var(--copper);
      }
    }

    &__options {
      margin: 0;
      @include mixins.eyebrow;
      font-size: 0.625rem;
    }

    &__controls {
      display: flex;
      align-items: center;
      gap: vars.$spacing-unit * 1.5;
      margin-block-start: 0.375rem;
    }

    &__remove {
      border: 0;
      background: transparent;
      padding: 0;
      color: var(--ink-faint);
      font-family: vars.$font-body;
      font-size: 0.75rem;
      text-decoration: underline;
      text-underline-offset: 2px;
      cursor: pointer;

      &:hover:not(:disabled),
      &:focus-visible:not(:disabled) {
        color: var(--critical);
      }

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }

    &__price {
      font-size: 0.9375rem;
      font-variant-numeric: tabular-nums;
    }
  }

  // A stepper built from rules rather than a boxed widget.
  .cart-qty {
    display: inline-flex;
    align-items: center;
    border: 1px solid var(--rule-strong);

    button {
      width: 1.75rem;
      height: 1.75rem;
      border: 0;
      background: transparent;
      color: var(--ink);
      font-family: vars.$font-body;
      font-size: 0.875rem;
      line-height: 1;
      cursor: pointer;
      transition: background-color 0.15s ease;

      &:hover:not(:disabled),
      &:focus-visible:not(:disabled) {
        background: var(--paper-sunk);
      }

      &:disabled {
        opacity: 0.35;
        cursor: not-allowed;
      }
    }

    &__value {
      min-width: 1.75rem;
      text-align: center;
      font-size: 0.8125rem;
      font-variant-numeric: tabular-nums;
      border-inline: 1px solid var(--rule-strong);
      line-height: 1.75rem;
    }
  }
</style>
