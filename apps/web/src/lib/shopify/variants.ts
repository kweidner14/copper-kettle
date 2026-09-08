import type { Product, ProductVariant } from './models'

/**
 * Variant selection, resolved server-side from the URL.
 *
 * The picker is plain links, not an island: each option value is an <a> to the
 * same page with one search param changed, and the server re-resolves the whole
 * selection per request. That keeps the only client framework in the project
 * reserved for the cart drawer, works with JS off, and makes every variant a
 * shareable URL.
 *
 * Handles all three shapes in this catalog:
 *   3 dimensions — Roast x Grind x Size (27 variants)
 *   2 dimensions — Grind x Size
 *   0 dimensions — a sampler pack, where Shopify still returns a synthetic
 *                  "Title / Default Title" option that must not be rendered.
 */

const DEFAULT_OPTION_NAME = 'Title'
const DEFAULT_OPTION_VALUE = 'Default Title'

export interface SelectedOption {
  name: string
  value: string
}

export interface OptionValueState {
  id: string
  value: string
  swatchColor: string | null
  selected: boolean
  /** A variant with this combination exists in the catalog at all. */
  exists: boolean
  /** ...and it is purchasable right now. */
  available: boolean
  /** URL that selects this value, keeping the other options as they are. */
  href: string
}

export interface OptionState {
  id: string
  name: string
  values: OptionValueState[]
}

export interface VariantSelection {
  /** Empty when the product has no real options. */
  options: OptionState[]
  selectedOptions: SelectedOption[]
  selectedVariant: ProductVariant | null
  hasOptions: boolean
}

/**
 * Shopify gives an option-less product one synthetic option, `Title` with the
 * single value `Default Title`. Rendering it would show the customer a picker
 * with one meaningless choice.
 */
export function hasRealOptions(product: Pick<Product, 'options'>): boolean {
  const options = product.options
  if (options.length === 0) return false
  if (options.length === 1 && options[0]?.name === DEFAULT_OPTION_NAME) {
    const values = options[0].optionValues
    return !(values.length === 1 && values[0]?.name === DEFAULT_OPTION_VALUE)
  }
  return true
}

/** True when the variant's options satisfy every entry in `selection`. */
function matchesSelection(variant: ProductVariant, selection: Map<string, string>): boolean {
  for (const [name, value] of selection) {
    const option = variant.selectedOptions.find((candidate) => candidate.name === name)
    if (!option || option.value !== value) return false
  }
  return true
}

/** Prefers a purchasable variant, but still returns a sold-out one over nothing. */
function pickVariant(variants: ProductVariant[]): ProductVariant | null {
  return variants.find((variant) => variant.availableForSale) ?? variants[0] ?? null
}

export function resolveVariantSelection(
  product: Pick<Product, 'options' | 'variants'>,
  url: URL,
): VariantSelection {
  const variants = product.variants.nodes
  const hasOptions = hasRealOptions(product)

  if (!hasOptions) {
    return {
      options: [],
      selectedOptions: [],
      selectedVariant: pickVariant(variants),
      hasOptions: false,
    }
  }

  const options = product.options

  // Only accept params that name a value the option actually has — otherwise a
  // hand-edited URL could pin the selection to a combination that cannot exist.
  const requested = new Map<string, string>()
  for (const option of options) {
    const value = url.searchParams.get(option.name)
    if (value && option.optionValues.some((candidate) => candidate.name === value)) {
      requested.set(option.name, value)
    }
  }

  // Narrow to the requested combination, relaxing the least-significant option
  // first if that combination has no variant. Dropping from the end keeps the
  // customer's earlier (broader) choices — picking Dark roast then a grind that
  // does not exist in 5lb should keep Dark, not reset it.
  const constraints = [...requested]
  let candidates: ProductVariant[] = []
  for (let end = constraints.length; end >= 0; end--) {
    const partial = new Map(constraints.slice(0, end))
    candidates = variants.filter((variant) => matchesSelection(variant, partial))
    if (candidates.length > 0) break
  }

  const selectedVariant = pickVariant(candidates)

  // The resolved variant is the source of truth for what is selected, so the
  // picker highlights what the customer will actually buy.
  const selection = new Map<string, string>(
    selectedVariant
      ? selectedVariant.selectedOptions.map((option) => [option.name, option.value])
      : options.map((option) => [option.name, option.optionValues[0]?.name ?? '']),
  )

  const optionStates: OptionState[] = options.map((option) => ({
    id: option.id,
    name: option.name,
    values: option.optionValues.map((optionValue) => {
      // Availability is tested one dimension at a time: hold every other option
      // where it is and swap just this one. This is what makes the
      // ground-5lb-style gaps show up as disabled rather than as a dead end.
      const candidate = new Map(selection)
      candidate.set(option.name, optionValue.name)

      const matching = variants.filter((variant) => matchesSelection(variant, candidate))

      const href = new URL(url)
      for (const [name, value] of candidate) href.searchParams.set(name, value)

      return {
        id: optionValue.id,
        value: optionValue.name,
        swatchColor: optionValue.swatch?.color ?? null,
        selected: selection.get(option.name) === optionValue.name,
        exists: matching.length > 0,
        available: matching.some((variant) => variant.availableForSale),
        href: `${href.pathname}${href.search}`,
      }
    }),
  }))

  return {
    options: optionStates,
    selectedOptions: [...selection].map(([name, value]) => ({ name, value })),
    selectedVariant,
    hasOptions: true,
  }
}
