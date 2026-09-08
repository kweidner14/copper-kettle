import { IMAGE_FIELDS, MONEY_FIELDS } from './fragments'

/**
 * Cart documents.
 *
 * The Cart object replaced Checkout in API 2026-01 — `checkoutCreate` no longer
 * exists. Checkout is reached by sending the customer to `cart.checkoutUrl`.
 *
 * Two shape notes that bite when writing these by hand:
 *   - `Cart.lines` is a `BaseCartLineConnection`, whose nodes are the
 *     `BaseCartLine` *interface*, so concrete fields need `... on CartLine`.
 *   - `merchandise` is the `Merchandise` union (currently only ProductVariant),
 *     so it needs an inline fragment too.
 *
 * `CartCost` here has no `totalTaxAmount` — tax is only known once an address
 * exists, which is checkout's job. Any tutorial selecting it is pre-2026.
 */
export const CART_FIELDS = `#graphql
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    createdAt
    updatedAt
    cost {
      subtotalAmount {
        ...MoneyFields
      }
      totalAmount {
        ...MoneyFields
      }
      subtotalAmountEstimated
      totalAmountEstimated
    }
    lines(first: 100) {
      nodes {
        ... on CartLine {
          id
          quantity
          cost {
            amountPerQuantity {
              ...MoneyFields
            }
            compareAtAmountPerQuantity {
              ...MoneyFields
            }
            totalAmount {
              ...MoneyFields
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              title
              availableForSale
              quantityAvailable
              weight
              weightUnit
              selectedOptions {
                name
                value
              }
              image {
                ...ImageFields
              }
              price {
                ...MoneyFields
              }
              product {
                id
                handle
                title
              }
            }
          }
        }
      }
    }
  }
` as const

export const CART_QUERY = `#graphql
  ${MONEY_FIELDS}
  ${IMAGE_FIELDS}
  ${CART_FIELDS}

  query Cart($cartId: ID!) {
    cart(id: $cartId) {
      ...CartFields
    }
  }
` as const

export const CART_CREATE_MUTATION = `#graphql
  ${MONEY_FIELDS}
  ${IMAGE_FIELDS}
  ${CART_FIELDS}

  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        ...CartFields
      }
      userErrors {
        code
        field
        message
      }
      warnings {
        code
        message
        target
      }
    }
  }
` as const

export const CART_LINES_ADD_MUTATION = `#graphql
  ${MONEY_FIELDS}
  ${IMAGE_FIELDS}
  ${CART_FIELDS}

  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        code
        field
        message
      }
      warnings {
        code
        message
        target
      }
    }
  }
` as const

export const CART_LINES_UPDATE_MUTATION = `#graphql
  ${MONEY_FIELDS}
  ${IMAGE_FIELDS}
  ${CART_FIELDS}

  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        code
        field
        message
      }
      warnings {
        code
        message
        target
      }
    }
  }
` as const

export const CART_LINES_REMOVE_MUTATION = `#graphql
  ${MONEY_FIELDS}
  ${IMAGE_FIELDS}
  ${CART_FIELDS}

  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartFields
      }
      userErrors {
        code
        field
        message
      }
      warnings {
        code
        message
        target
      }
    }
  }
` as const
