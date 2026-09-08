import type { Money } from './models'

/**
 * Storefront API money amounts are decimal *strings* ("18.00"), not numbers, so
 * they survive the JSON round trip without float drift. Parse late, never store
 * the parsed value back.
 */
export function formatMoney(money: Money, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: money.currencyCode,
    // Shopify sends "18.0" for whole amounts; force two decimals for display.
    minimumFractionDigits: 2,
  }).format(Number(money.amount))
}

/**
 * A product spanning several price points shows a range ("$18.00 – $95.00").
 * When min and max match — a single variant, or uniform pricing — it collapses
 * to one figure.
 */
export function formatPriceRange(min: Money, max: Money, locale = 'en-US'): string {
  if (Number(min.amount) === Number(max.amount)) return formatMoney(min, locale)
  return `${formatMoney(min, locale)} – ${formatMoney(max, locale)}`
}

/** True when `compareAtPrice` represents a real markdown, not an equal placeholder. */
export function isOnSale(price: Money, compareAtPrice?: Money | null): boolean {
  if (!compareAtPrice) return false
  return Number(compareAtPrice.amount) > Number(price.amount)
}

/** Percentage off, rounded — only meaningful when isOnSale() is true. */
export function discountPercent(price: Money, compareAtPrice: Money): number {
  const was = Number(compareAtPrice.amount)
  const now = Number(price.amount)
  if (was <= 0 || now >= was) return 0
  return Math.round(((was - now) / was) * 100)
}
