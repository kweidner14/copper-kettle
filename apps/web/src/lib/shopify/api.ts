import { getBuyerIp, storefront } from './client'
import { COLLECTION_QUERY, COLLECTIONS_QUERY } from './queries/collections'
import { PRODUCT_QUERY, PRODUCTS_QUERY } from './queries/products'
import type {
  Collection,
  CollectionSummary,
  Product,
  ProductPage,
} from './models'
import type {
  CollectionQuery,
  CollectionQueryVariables,
  CollectionsQuery,
  CollectionsQueryVariables,
  ProductQuery,
  ProductQueryVariables,
  ProductsQuery,
  ProductsQueryVariables,
} from './types/storefront.generated'

/**
 * Per-request data layer.
 *
 * Built from the Astro context rather than imported as a singleton so that
 * `Shopify-Storefront-Buyer-IP` is resolved once per request and attached to
 * every call. Forgetting that header is the kind of thing that only shows up
 * later as mysterious throttling, so it is made structural: there is no exported
 * way to fetch product data *without* going through here.
 *
 * Usage in a page:
 *   const shopify = createShopifyApi(Astro)
 *   const product = await shopify.getProduct(handle)
 */

/** Structurally satisfied by both `Astro` and an `APIContext`. */
export interface ShopifyRequestContext {
  request: Request
  clientAddress?: string
}

export const DEFAULT_PAGE_SIZE = 24

export type ProductSortKey = NonNullable<ProductsQueryVariables['sortKey']>
export type CollectionProductSortKey = NonNullable<CollectionQueryVariables['sortKey']>

/** Cursor window. The Storefront API accepts first+after or last+before, never both. */
export interface Pagination {
  first?: number
  last?: number
  after?: string | undefined
  before?: string | undefined
}

/**
 * Reads a cursor window off the URL. `?before=` takes precedence because it only
 * appears on an explicit "previous" link, whereas `?after=` may linger.
 */
export function paginationFromUrl(url: URL, pageSize = DEFAULT_PAGE_SIZE): Pagination {
  const before = url.searchParams.get('before')
  if (before) return { last: pageSize, before }

  return { first: pageSize, after: url.searchParams.get('after') ?? undefined }
}

export function createShopifyApi(context: ShopifyRequestContext) {
  const buyerIp = getBuyerIp(context)

  const call = <TData, TVariables>(query: string, variables?: TVariables) =>
    storefront<TData, TVariables>(query, { variables, buyerIp })

  return {
    /** One page of the whole catalog. */
    async getProducts(
      options: Pagination & { sortKey?: ProductSortKey; reverse?: boolean; query?: string } = {},
    ): Promise<ProductPage> {
      const { first, last, after, before, sortKey, reverse, query } = {
        first: DEFAULT_PAGE_SIZE,
        ...options,
      }

      const data = await call<ProductsQuery, ProductsQueryVariables>(PRODUCTS_QUERY, {
        first: last ? undefined : first,
        last,
        after,
        before,
        sortKey,
        reverse,
        query,
      })

      return { products: data.products.nodes, pageInfo: data.products.pageInfo }
    },

    /** Full product detail including the entire variant matrix. Null when unpublished. */
    async getProduct(handle: string): Promise<Product | null> {
      const data = await call<ProductQuery, ProductQueryVariables>(PRODUCT_QUERY, { handle })
      return data.product ?? null
    },

    async getCollections(first = 50): Promise<CollectionSummary[]> {
      const data = await call<CollectionsQuery, CollectionsQueryVariables>(COLLECTIONS_QUERY, {
        first,
      })
      return data.collections.nodes
    },

    async getCollection(
      handle: string,
      options: Pagination & { sortKey?: CollectionProductSortKey; reverse?: boolean } = {},
    ): Promise<Collection | null> {
      const { first, last, after, before, sortKey, reverse } = {
        first: DEFAULT_PAGE_SIZE,
        ...options,
      }

      const data = await call<CollectionQuery, CollectionQueryVariables>(COLLECTION_QUERY, {
        handle,
        first: last ? undefined : first,
        last,
        after,
        before,
        sortKey,
        reverse,
      })

      return data.collection ?? null
    },
  }
}

export type ShopifyApi = ReturnType<typeof createShopifyApi>
