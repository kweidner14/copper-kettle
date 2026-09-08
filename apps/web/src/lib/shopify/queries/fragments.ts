// Shared Storefront API fragments.
//
// Each const holds exactly ONE fragment definition and only *references* the
// others by spread. Queries assemble the full set they need (see products.ts),
// which keeps a fragment from being defined twice in the same document — GraphQL
// rejects that, and it is the easiest mistake to make when composing by
// template literal.
//
// The `#graphql` prefix is what @shopify/api-codegen-preset plucks on; without
// it the document is invisible to codegen and you get no types.

export const MONEY_FIELDS = `#graphql
  fragment MoneyFields on MoneyV2 {
    amount
    currencyCode
  }
` as const

export const IMAGE_FIELDS = `#graphql
  fragment ImageFields on Image {
    url
    altText
    width
    height
  }
` as const

export const PAGE_INFO_FIELDS = `#graphql
  fragment PageInfoFields on PageInfo {
    hasNextPage
    hasPreviousPage
    startCursor
    endCursor
  }
` as const

/** Everything a product grid tile needs — deliberately smaller than the detail query. */
export const PRODUCT_CARD_FIELDS = `#graphql
  fragment ProductCardFields on Product {
    id
    handle
    title
    vendor
    availableForSale
    featuredImage {
      ...ImageFields
    }
    priceRange {
      minVariantPrice {
        ...MoneyFields
      }
      maxVariantPrice {
        ...MoneyFields
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        ...MoneyFields
      }
    }
    variantsCount {
      count
    }
  }
` as const

/**
 * `weight`/`weightUnit` come back in whatever unit each variant was saved in —
 * this catalog mixes OUNCES and POUNDS on the same product. Never display or
 * sum these raw; run them through toGrams() in ../weight.ts first.
 */
export const PRODUCT_VARIANT_FIELDS = `#graphql
  fragment ProductVariantFields on ProductVariant {
    id
    title
    availableForSale
    currentlyNotInStock
    quantityAvailable
    sku
    requiresShipping
    weight
    weightUnit
    price {
      ...MoneyFields
    }
    compareAtPrice {
      ...MoneyFields
    }
    selectedOptions {
      name
      value
    }
    image {
      ...ImageFields
    }
  }
` as const
