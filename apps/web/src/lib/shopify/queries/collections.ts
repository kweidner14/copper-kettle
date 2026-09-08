import {
  IMAGE_FIELDS,
  MONEY_FIELDS,
  PAGE_INFO_FIELDS,
  PRODUCT_CARD_FIELDS,
} from './fragments'

/** Collection list, for navigation and the /collections index. */
export const COLLECTIONS_QUERY = `#graphql
  ${IMAGE_FIELDS}

  query Collections($first: Int!) {
    collections(first: $first, sortKey: TITLE) {
      nodes {
        id
        handle
        title
        description
        image {
          ...ImageFields
        }
      }
    }
  }
` as const

/** A single collection plus one page of its products. */
export const COLLECTION_QUERY = `#graphql
  ${MONEY_FIELDS}
  ${IMAGE_FIELDS}
  ${PAGE_INFO_FIELDS}
  ${PRODUCT_CARD_FIELDS}

  query Collection(
    $handle: String!
    $first: Int
    $last: Int
    $after: String
    $before: String
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
  ) {
    collection(handle: $handle) {
      id
      handle
      title
      descriptionHtml
      seo {
        title
        description
      }
      image {
        ...ImageFields
      }
      products(
        first: $first
        last: $last
        after: $after
        before: $before
        sortKey: $sortKey
        reverse: $reverse
      ) {
        nodes {
          ...ProductCardFields
        }
        pageInfo {
          ...PageInfoFields
        }
      }
    }
  }
` as const
