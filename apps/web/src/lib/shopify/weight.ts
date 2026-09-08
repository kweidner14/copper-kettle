import type { ProductVariant } from './models'

/**
 * Variant weights come back in whatever unit each variant was saved in, and this
 * catalog genuinely mixes them — the 12oz coffee is stored in OUNCES while the
 * 5lb bag is in POUNDS, on the *same product*. Summing or comparing the raw
 * `weight` floats across variants is therefore always wrong.
 *
 * Everything normalises to grams first. Grams (not kilograms) because Shopify's
 * own shipping weights are integers in grams, so this keeps rounding in one place.
 */

type WeightUnit = NonNullable<ProductVariant['weightUnit']>

const GRAMS_PER_UNIT: Record<WeightUnit, number> = {
  GRAMS: 1,
  KILOGRAMS: 1000,
  // Exact international avoirdupois definitions, not the usual 28.35 / 454.
  OUNCES: 28.349523125,
  POUNDS: 453.59237,
}

/** Normalises one variant's stored weight to grams. Returns null when unset. */
export function toGrams(
  weight: number | null | undefined,
  unit: WeightUnit | null | undefined,
): number | null {
  if (weight == null || unit == null) return null
  const factor = GRAMS_PER_UNIT[unit]
  if (factor === undefined) return null
  return weight * factor
}

/** Convenience wrapper for the common `toGrams(v.weight, v.weightUnit)` call. */
export function variantWeightInGrams(variant: {
  weight?: number | null
  weightUnit?: WeightUnit | null
}): number | null {
  return toGrams(variant.weight, variant.weightUnit)
}

/**
 * Sums normalised weights. Variants with no weight contribute nothing rather
 * than poisoning the total with NaN.
 */
export function totalGrams(
  lines: { weight?: number | null; weightUnit?: WeightUnit | null; quantity?: number }[],
): number {
  return lines.reduce((total, line) => {
    const grams = variantWeightInGrams(line)
    if (grams == null) return total
    return total + grams * (line.quantity ?? 1)
  }, 0)
}

/**
 * Display helper. Shows grams under 1kg and kilograms above, which matches how
 * the weight-based shipping bands are drawn (0–1kg / 1–3kg / 3kg+).
 */
export function formatWeight(grams: number | null, locale = 'en-US'): string | null {
  if (grams == null) return null
  if (grams < 1000) {
    return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(grams)} g`
  }
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(grams / 1000)} kg`
}
