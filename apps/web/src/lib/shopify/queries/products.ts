import {
  IMAGE_FIELDS,
  MONEY_FIELDS,
  PAGE_INFO_FIELDS,
  PRODUCT_CARD_FIELDS,
  PRODUCT_VARIANT_FIELDS,
} from './fragments'

/** Paginated product listing. Cursor-based — the Storefront API has no offsets. */
export const PRODUCTS_QUERY = `#graphql
  ${MONEY_FIELDS}
  ${IMAGE_FIELDS}
  ${PAGE_INFO_FIELDS}
  ${PRODUCT_CARD_FIELDS}

  query Products(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
    $query: String
  ) {
    products(
      first: $first
      last: $last
      after: $after
      before: $before
      sortKey: $sortKey
      reverse: $reverse
      query: $query
    ) {
      nodes {
        ...ProductCardFields
      }
      pageInfo {
        ...PageInfoFields
      }
    }
  }
` as const

/**
 * Product detail.
 *
 * `variants(first: 250)` is the whole variant matrix in one shot. 250 is the
 * Storefront API's per-page ceiling; the largest product here is 3x3x3 = 27, so
 * a single page covers it. If a future product exceeds 250 variants this needs
 * to page, or move to `encodedVariantAvailability` — see ../variants.ts.
 *
 * `options { optionValues }` is fetched separately from the variants because it
 * preserves the merchant's ordering and carries swatch data, which the flattened
 * variant list does not.
 */
export const PRODUCT_QUERY = `#graphql
  ${MONEY_FIELDS}
  ${IMAGE_FIELDS}
  ${PRODUCT_VARIANT_FIELDS}

  query Product($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      vendor
      productType
      tags
      descriptionHtml
      availableForSale
      totalInventory
      seo {
        title
        description
      }
      featuredImage {
        ...ImageFields
      }
      images(first: 12) {
        nodes {
          ...ImageFields
        }
      }
      options {
        id
        name
        optionValues {
          id
          name
          swatch {
            color
          }
        }
      }
      priceRange {
        minVariantPrice {
          ...MoneyFields
        }
        maxVariantPrice {
          ...MoneyFields
        }
      }
      variants(first: 250) {
        nodes {
          ...ProductVariantFields
        }
      }
    }
  }
` as const
