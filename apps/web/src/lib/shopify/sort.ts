import type { CollectionProductSortKey, ProductSortKey } from './api'

/**
 * Sort orders, as the visitor sees them.
 *
 * The URL carries a short, readable value (`?sort=price-asc`) rather than the
 * API's sort key, so links stay stable if the mapping changes and nothing the
 * visitor types reaches the API unchecked: an unknown value falls back to the
 * page's default.
 *
 * The catalogue and a collection sort with different enums (ProductSortKeys vs
 * ProductCollectionSortKeys), so each value maps to both. "featured" means best
 * selling on the catalogue and the merchant's own order inside a collection.
 */

export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price, low to high' },
  { value: 'price-desc', label: 'Price, high to low' },
  { value: 'newest', label: 'Newest' },
  { value: 'title', label: 'Name, A to Z' },
] as const

export type SortValue = (typeof SORT_OPTIONS)[number]['value']

export interface SortOption {
  value: SortValue
  label: string
}

/** The options a page offers. Relevance only means something with a search query. */
export function sortOptions(context: 'catalog' | 'search'): SortOption[] {
  return SORT_OPTIONS.filter((option) =>
    context === 'search' ? option.value !== 'featured' : option.value !== 'relevance',
  )
}

/** Reads `?sort=`, falling back to `fallback` for a missing or unknown value. */
export function readSort(url: URL, options: SortOption[], fallback: SortValue): SortValue {
  const requested = url.searchParams.get('sort')
  return options.find((option) => option.value === requested)?.value ?? fallback
}

const PRODUCT_SORT: Record<SortValue, { sortKey: ProductSortKey; reverse: boolean }> = {
  relevance: { sortKey: 'RELEVANCE', reverse: false },
  featured: { sortKey: 'BEST_SELLING', reverse: false },
  'price-asc': { sortKey: 'PRICE', reverse: false },
  'price-desc': { sortKey: 'PRICE', reverse: true },
  newest: { sortKey: 'CREATED_AT', reverse: true },
  title: { sortKey: 'TITLE', reverse: false },
}

const COLLECTION_SORT: Record<SortValue, { sortKey: CollectionProductSortKey; reverse: boolean }> =
  {
    relevance: { sortKey: 'RELEVANCE', reverse: false },
    featured: { sortKey: 'COLLECTION_DEFAULT', reverse: false },
    'price-asc': { sortKey: 'PRICE', reverse: false },
    'price-desc': { sortKey: 'PRICE', reverse: true },
    newest: { sortKey: 'CREATED', reverse: true },
    title: { sortKey: 'TITLE', reverse: false },
  }

export const productSort = (value: SortValue) => PRODUCT_SORT[value]
export const collectionSort = (value: SortValue) => COLLECTION_SORT[value]
