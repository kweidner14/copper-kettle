/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as StorefrontTypes from './storefront.types.js';

export type CartFieldsFragment = (
  Pick<StorefrontTypes.Cart, 'id' | 'checkoutUrl' | 'totalQuantity' | 'createdAt' | 'updatedAt'>
  & { cost: (
    Pick<StorefrontTypes.CartCost, 'subtotalAmountEstimated' | 'totalAmountEstimated'>
    & { subtotalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }
  ), lines: { nodes: Array<(
      Pick<StorefrontTypes.CartLine, 'id' | 'quantity'>
      & { cost: { amountPerQuantity: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, compareAtAmountPerQuantity?: StorefrontTypes.Maybe<Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>>, totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, merchandise: (
        Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale' | 'quantityAvailable' | 'weight' | 'weightUnit'>
        & { selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>>, image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>>, price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, product: Pick<StorefrontTypes.Product, 'id' | 'handle' | 'title'> }
      ) }
    )> } }
);

export type CartQueryVariables = StorefrontTypes.Exact<{
  cartId: StorefrontTypes.Scalars['ID']['input'];
}>;


export type CartQuery = { cart?: StorefrontTypes.Maybe<(
    Pick<StorefrontTypes.Cart, 'id' | 'checkoutUrl' | 'totalQuantity' | 'createdAt' | 'updatedAt'>
    & { cost: (
      Pick<StorefrontTypes.CartCost, 'subtotalAmountEstimated' | 'totalAmountEstimated'>
      & { subtotalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }
    ), lines: { nodes: Array<(
        Pick<StorefrontTypes.CartLine, 'id' | 'quantity'>
        & { cost: { amountPerQuantity: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, compareAtAmountPerQuantity?: StorefrontTypes.Maybe<Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>>, totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, merchandise: (
          Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale' | 'quantityAvailable' | 'weight' | 'weightUnit'>
          & { selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>>, image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>>, price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, product: Pick<StorefrontTypes.Product, 'id' | 'handle' | 'title'> }
        ) }
      )> } }
  )> };

export type CartCreateMutationVariables = StorefrontTypes.Exact<{
  input: StorefrontTypes.CartInput;
}>;


export type CartCreateMutation = { cartCreate?: StorefrontTypes.Maybe<{ cart?: StorefrontTypes.Maybe<(
      Pick<StorefrontTypes.Cart, 'id' | 'checkoutUrl' | 'totalQuantity' | 'createdAt' | 'updatedAt'>
      & { cost: (
        Pick<StorefrontTypes.CartCost, 'subtotalAmountEstimated' | 'totalAmountEstimated'>
        & { subtotalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }
      ), lines: { nodes: Array<(
          Pick<StorefrontTypes.CartLine, 'id' | 'quantity'>
          & { cost: { amountPerQuantity: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, compareAtAmountPerQuantity?: StorefrontTypes.Maybe<Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>>, totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, merchandise: (
            Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale' | 'quantityAvailable' | 'weight' | 'weightUnit'>
            & { selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>>, image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>>, price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, product: Pick<StorefrontTypes.Product, 'id' | 'handle' | 'title'> }
          ) }
        )> } }
    )>, userErrors: Array<Pick<StorefrontTypes.CartUserError, 'code' | 'field' | 'message'>>, warnings: Array<Pick<StorefrontTypes.CartWarning, 'code' | 'message' | 'target'>> }> };

export type CartLinesAddMutationVariables = StorefrontTypes.Exact<{
  cartId: StorefrontTypes.Scalars['ID']['input'];
  lines: Array<StorefrontTypes.CartLineInput> | StorefrontTypes.CartLineInput;
}>;


export type CartLinesAddMutation = { cartLinesAdd?: StorefrontTypes.Maybe<{ cart?: StorefrontTypes.Maybe<(
      Pick<StorefrontTypes.Cart, 'id' | 'checkoutUrl' | 'totalQuantity' | 'createdAt' | 'updatedAt'>
      & { cost: (
        Pick<StorefrontTypes.CartCost, 'subtotalAmountEstimated' | 'totalAmountEstimated'>
        & { subtotalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }
      ), lines: { nodes: Array<(
          Pick<StorefrontTypes.CartLine, 'id' | 'quantity'>
          & { cost: { amountPerQuantity: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, compareAtAmountPerQuantity?: StorefrontTypes.Maybe<Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>>, totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, merchandise: (
            Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale' | 'quantityAvailable' | 'weight' | 'weightUnit'>
            & { selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>>, image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>>, price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, product: Pick<StorefrontTypes.Product, 'id' | 'handle' | 'title'> }
          ) }
        )> } }
    )>, userErrors: Array<Pick<StorefrontTypes.CartUserError, 'code' | 'field' | 'message'>>, warnings: Array<Pick<StorefrontTypes.CartWarning, 'code' | 'message' | 'target'>> }> };

export type CartLinesUpdateMutationVariables = StorefrontTypes.Exact<{
  cartId: StorefrontTypes.Scalars['ID']['input'];
  lines: Array<StorefrontTypes.CartLineUpdateInput> | StorefrontTypes.CartLineUpdateInput;
}>;


export type CartLinesUpdateMutation = { cartLinesUpdate?: StorefrontTypes.Maybe<{ cart?: StorefrontTypes.Maybe<(
      Pick<StorefrontTypes.Cart, 'id' | 'checkoutUrl' | 'totalQuantity' | 'createdAt' | 'updatedAt'>
      & { cost: (
        Pick<StorefrontTypes.CartCost, 'subtotalAmountEstimated' | 'totalAmountEstimated'>
        & { subtotalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }
      ), lines: { nodes: Array<(
          Pick<StorefrontTypes.CartLine, 'id' | 'quantity'>
          & { cost: { amountPerQuantity: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, compareAtAmountPerQuantity?: StorefrontTypes.Maybe<Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>>, totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, merchandise: (
            Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale' | 'quantityAvailable' | 'weight' | 'weightUnit'>
            & { selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>>, image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>>, price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, product: Pick<StorefrontTypes.Product, 'id' | 'handle' | 'title'> }
          ) }
        )> } }
    )>, userErrors: Array<Pick<StorefrontTypes.CartUserError, 'code' | 'field' | 'message'>>, warnings: Array<Pick<StorefrontTypes.CartWarning, 'code' | 'message' | 'target'>> }> };

export type CartLinesRemoveMutationVariables = StorefrontTypes.Exact<{
  cartId: StorefrontTypes.Scalars['ID']['input'];
  lineIds: Array<StorefrontTypes.Scalars['ID']['input']> | StorefrontTypes.Scalars['ID']['input'];
}>;


export type CartLinesRemoveMutation = { cartLinesRemove?: StorefrontTypes.Maybe<{ cart?: StorefrontTypes.Maybe<(
      Pick<StorefrontTypes.Cart, 'id' | 'checkoutUrl' | 'totalQuantity' | 'createdAt' | 'updatedAt'>
      & { cost: (
        Pick<StorefrontTypes.CartCost, 'subtotalAmountEstimated' | 'totalAmountEstimated'>
        & { subtotalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }
      ), lines: { nodes: Array<(
          Pick<StorefrontTypes.CartLine, 'id' | 'quantity'>
          & { cost: { amountPerQuantity: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, compareAtAmountPerQuantity?: StorefrontTypes.Maybe<Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>>, totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, merchandise: (
            Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale' | 'quantityAvailable' | 'weight' | 'weightUnit'>
            & { selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>>, image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>>, price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, product: Pick<StorefrontTypes.Product, 'id' | 'handle' | 'title'> }
          ) }
        )> } }
    )>, userErrors: Array<Pick<StorefrontTypes.CartUserError, 'code' | 'field' | 'message'>>, warnings: Array<Pick<StorefrontTypes.CartWarning, 'code' | 'message' | 'target'>> }> };

export type CollectionsQueryVariables = StorefrontTypes.Exact<{
  first: StorefrontTypes.Scalars['Int']['input'];
}>;


export type CollectionsQuery = { collections: { nodes: Array<(
      Pick<StorefrontTypes.Collection, 'id' | 'handle' | 'title' | 'description'>
      & { image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>> }
    )> } };

export type CollectionQueryVariables = StorefrontTypes.Exact<{
  handle: StorefrontTypes.Scalars['String']['input'];
  first?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['Int']['input']>;
  last?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['Int']['input']>;
  after?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['String']['input']>;
  before?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['String']['input']>;
  sortKey?: StorefrontTypes.InputMaybe<StorefrontTypes.ProductCollectionSortKeys>;
  reverse?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['Boolean']['input']>;
}>;


export type CollectionQuery = { collection?: StorefrontTypes.Maybe<(
    Pick<StorefrontTypes.Collection, 'id' | 'handle' | 'title' | 'descriptionHtml'>
    & { seo: Pick<StorefrontTypes.Seo, 'title' | 'description'>, image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>>, products: { nodes: Array<(
        Pick<StorefrontTypes.Product, 'id' | 'handle' | 'title' | 'vendor' | 'availableForSale'>
        & { featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>>, priceRange: { minVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, compareAtPriceRange: { minVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, variantsCount?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Count, 'count'>> }
      )>, pageInfo: Pick<StorefrontTypes.PageInfo, 'hasNextPage' | 'hasPreviousPage' | 'startCursor' | 'endCursor'> } }
  )> };

export type MoneyFieldsFragment = Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>;

export type ImageFieldsFragment = Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>;

export type PageInfoFieldsFragment = Pick<StorefrontTypes.PageInfo, 'hasNextPage' | 'hasPreviousPage' | 'startCursor' | 'endCursor'>;

export type ProductCardFieldsFragment = (
  Pick<StorefrontTypes.Product, 'id' | 'handle' | 'title' | 'vendor' | 'availableForSale'>
  & { featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>>, priceRange: { minVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, compareAtPriceRange: { minVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, variantsCount?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Count, 'count'>> }
);

export type ProductVariantFieldsFragment = (
  Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale' | 'currentlyNotInStock' | 'quantityAvailable' | 'sku' | 'requiresShipping' | 'weight' | 'weightUnit'>
  & { price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, compareAtPrice?: StorefrontTypes.Maybe<Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>>, selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>>, image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>> }
);

export type ProductsQueryVariables = StorefrontTypes.Exact<{
  first?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['Int']['input']>;
  last?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['Int']['input']>;
  after?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['String']['input']>;
  before?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['String']['input']>;
  sortKey?: StorefrontTypes.InputMaybe<StorefrontTypes.ProductSortKeys>;
  reverse?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['Boolean']['input']>;
  query?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['String']['input']>;
}>;


export type ProductsQuery = { products: { nodes: Array<(
      Pick<StorefrontTypes.Product, 'id' | 'handle' | 'title' | 'vendor' | 'availableForSale'>
      & { featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>>, priceRange: { minVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, compareAtPriceRange: { minVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, variantsCount?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Count, 'count'>> }
    )>, pageInfo: Pick<StorefrontTypes.PageInfo, 'hasNextPage' | 'hasPreviousPage' | 'startCursor' | 'endCursor'> } };

export type ProductQueryVariables = StorefrontTypes.Exact<{
  handle: StorefrontTypes.Scalars['String']['input'];
}>;


export type ProductQuery = { product?: StorefrontTypes.Maybe<(
    Pick<StorefrontTypes.Product, 'id' | 'handle' | 'title' | 'vendor' | 'productType' | 'tags' | 'descriptionHtml' | 'availableForSale' | 'totalInventory'>
    & { seo: Pick<StorefrontTypes.Seo, 'title' | 'description'>, featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>>, images: { nodes: Array<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>> }, options: Array<(
      Pick<StorefrontTypes.ProductOption, 'id' | 'name'>
      & { optionValues: Array<(
        Pick<StorefrontTypes.ProductOptionValue, 'id' | 'name'>
        & { swatch?: StorefrontTypes.Maybe<Pick<StorefrontTypes.ProductOptionValueSwatch, 'color'>> }
      )> }
    )>, priceRange: { minVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, variants: { nodes: Array<(
        Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale' | 'currentlyNotInStock' | 'quantityAvailable' | 'sku' | 'requiresShipping' | 'weight' | 'weightUnit'>
        & { price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, compareAtPrice?: StorefrontTypes.Maybe<Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>>, selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>>, image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>> }
      )> } }
  )> };

interface GeneratedQueryTypes {
  "#graphql\n  #graphql\n  fragment MoneyFields on MoneyV2 {\n    amount\n    currencyCode\n  }\n\n  #graphql\n  fragment ImageFields on Image {\n    url\n    altText\n    width\n    height\n  }\n\n  #graphql\n  fragment CartFields on Cart {\n    id\n    checkoutUrl\n    totalQuantity\n    createdAt\n    updatedAt\n    cost {\n      subtotalAmount {\n        ...MoneyFields\n      }\n      totalAmount {\n        ...MoneyFields\n      }\n      subtotalAmountEstimated\n      totalAmountEstimated\n    }\n    lines(first: 100) {\n      nodes {\n        ... on CartLine {\n          id\n          quantity\n          cost {\n            amountPerQuantity {\n              ...MoneyFields\n            }\n            compareAtAmountPerQuantity {\n              ...MoneyFields\n            }\n            totalAmount {\n              ...MoneyFields\n            }\n          }\n          merchandise {\n            ... on ProductVariant {\n              id\n              title\n              availableForSale\n              quantityAvailable\n              weight\n              weightUnit\n              selectedOptions {\n                name\n                value\n              }\n              image {\n                ...ImageFields\n              }\n              price {\n                ...MoneyFields\n              }\n              product {\n                id\n                handle\n                title\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n\n\n  query Cart($cartId: ID!) {\n    cart(id: $cartId) {\n      ...CartFields\n    }\n  }\n": {return: CartQuery, variables: CartQueryVariables},
  "#graphql\n  #graphql\n  fragment ImageFields on Image {\n    url\n    altText\n    width\n    height\n  }\n\n\n  query Collections($first: Int!) {\n    collections(first: $first, sortKey: TITLE) {\n      nodes {\n        id\n        handle\n        title\n        description\n        image {\n          ...ImageFields\n        }\n      }\n    }\n  }\n": {return: CollectionsQuery, variables: CollectionsQueryVariables},
  "#graphql\n  #graphql\n  fragment MoneyFields on MoneyV2 {\n    amount\n    currencyCode\n  }\n\n  #graphql\n  fragment ImageFields on Image {\n    url\n    altText\n    width\n    height\n  }\n\n  #graphql\n  fragment PageInfoFields on PageInfo {\n    hasNextPage\n    hasPreviousPage\n    startCursor\n    endCursor\n  }\n\n  #graphql\n  fragment ProductCardFields on Product {\n    id\n    handle\n    title\n    vendor\n    availableForSale\n    featuredImage {\n      ...ImageFields\n    }\n    priceRange {\n      minVariantPrice {\n        ...MoneyFields\n      }\n      maxVariantPrice {\n        ...MoneyFields\n      }\n    }\n    compareAtPriceRange {\n      minVariantPrice {\n        ...MoneyFields\n      }\n    }\n    variantsCount {\n      count\n    }\n  }\n\n\n  query Collection(\n    $handle: String!\n    $first: Int\n    $last: Int\n    $after: String\n    $before: String\n    $sortKey: ProductCollectionSortKeys\n    $reverse: Boolean\n  ) {\n    collection(handle: $handle) {\n      id\n      handle\n      title\n      descriptionHtml\n      seo {\n        title\n        description\n      }\n      image {\n        ...ImageFields\n      }\n      products(\n        first: $first\n        last: $last\n        after: $after\n        before: $before\n        sortKey: $sortKey\n        reverse: $reverse\n      ) {\n        nodes {\n          ...ProductCardFields\n        }\n        pageInfo {\n          ...PageInfoFields\n        }\n      }\n    }\n  }\n": {return: CollectionQuery, variables: CollectionQueryVariables},
  "#graphql\n  #graphql\n  fragment MoneyFields on MoneyV2 {\n    amount\n    currencyCode\n  }\n\n  #graphql\n  fragment ImageFields on Image {\n    url\n    altText\n    width\n    height\n  }\n\n  #graphql\n  fragment PageInfoFields on PageInfo {\n    hasNextPage\n    hasPreviousPage\n    startCursor\n    endCursor\n  }\n\n  #graphql\n  fragment ProductCardFields on Product {\n    id\n    handle\n    title\n    vendor\n    availableForSale\n    featuredImage {\n      ...ImageFields\n    }\n    priceRange {\n      minVariantPrice {\n        ...MoneyFields\n      }\n      maxVariantPrice {\n        ...MoneyFields\n      }\n    }\n    compareAtPriceRange {\n      minVariantPrice {\n        ...MoneyFields\n      }\n    }\n    variantsCount {\n      count\n    }\n  }\n\n\n  query Products(\n    $first: Int\n    $last: Int\n    $after: String\n    $before: String\n    $sortKey: ProductSortKeys\n    $reverse: Boolean\n    $query: String\n  ) {\n    products(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      sortKey: $sortKey\n      reverse: $reverse\n      query: $query\n    ) {\n      nodes {\n        ...ProductCardFields\n      }\n      pageInfo {\n        ...PageInfoFields\n      }\n    }\n  }\n": {return: ProductsQuery, variables: ProductsQueryVariables},
  "#graphql\n  #graphql\n  fragment MoneyFields on MoneyV2 {\n    amount\n    currencyCode\n  }\n\n  #graphql\n  fragment ImageFields on Image {\n    url\n    altText\n    width\n    height\n  }\n\n  #graphql\n  fragment ProductVariantFields on ProductVariant {\n    id\n    title\n    availableForSale\n    currentlyNotInStock\n    quantityAvailable\n    sku\n    requiresShipping\n    weight\n    weightUnit\n    price {\n      ...MoneyFields\n    }\n    compareAtPrice {\n      ...MoneyFields\n    }\n    selectedOptions {\n      name\n      value\n    }\n    image {\n      ...ImageFields\n    }\n  }\n\n\n  query Product($handle: String!) {\n    product(handle: $handle) {\n      id\n      handle\n      title\n      vendor\n      productType\n      tags\n      descriptionHtml\n      availableForSale\n      totalInventory\n      seo {\n        title\n        description\n      }\n      featuredImage {\n        ...ImageFields\n      }\n      images(first: 12) {\n        nodes {\n          ...ImageFields\n        }\n      }\n      options {\n        id\n        name\n        optionValues {\n          id\n          name\n          swatch {\n            color\n          }\n        }\n      }\n      priceRange {\n        minVariantPrice {\n          ...MoneyFields\n        }\n        maxVariantPrice {\n          ...MoneyFields\n        }\n      }\n      variants(first: 250) {\n        nodes {\n          ...ProductVariantFields\n        }\n      }\n    }\n  }\n": {return: ProductQuery, variables: ProductQueryVariables},
}

interface GeneratedMutationTypes {
  "#graphql\n  #graphql\n  fragment MoneyFields on MoneyV2 {\n    amount\n    currencyCode\n  }\n\n  #graphql\n  fragment ImageFields on Image {\n    url\n    altText\n    width\n    height\n  }\n\n  #graphql\n  fragment CartFields on Cart {\n    id\n    checkoutUrl\n    totalQuantity\n    createdAt\n    updatedAt\n    cost {\n      subtotalAmount {\n        ...MoneyFields\n      }\n      totalAmount {\n        ...MoneyFields\n      }\n      subtotalAmountEstimated\n      totalAmountEstimated\n    }\n    lines(first: 100) {\n      nodes {\n        ... on CartLine {\n          id\n          quantity\n          cost {\n            amountPerQuantity {\n              ...MoneyFields\n            }\n            compareAtAmountPerQuantity {\n              ...MoneyFields\n            }\n            totalAmount {\n              ...MoneyFields\n            }\n          }\n          merchandise {\n            ... on ProductVariant {\n              id\n              title\n              availableForSale\n              quantityAvailable\n              weight\n              weightUnit\n              selectedOptions {\n                name\n                value\n              }\n              image {\n                ...ImageFields\n              }\n              price {\n                ...MoneyFields\n              }\n              product {\n                id\n                handle\n                title\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n\n\n  mutation CartCreate($input: CartInput!) {\n    cartCreate(input: $input) {\n      cart {\n        ...CartFields\n      }\n      userErrors {\n        code\n        field\n        message\n      }\n      warnings {\n        code\n        message\n        target\n      }\n    }\n  }\n": {return: CartCreateMutation, variables: CartCreateMutationVariables},
  "#graphql\n  #graphql\n  fragment MoneyFields on MoneyV2 {\n    amount\n    currencyCode\n  }\n\n  #graphql\n  fragment ImageFields on Image {\n    url\n    altText\n    width\n    height\n  }\n\n  #graphql\n  fragment CartFields on Cart {\n    id\n    checkoutUrl\n    totalQuantity\n    createdAt\n    updatedAt\n    cost {\n      subtotalAmount {\n        ...MoneyFields\n      }\n      totalAmount {\n        ...MoneyFields\n      }\n      subtotalAmountEstimated\n      totalAmountEstimated\n    }\n    lines(first: 100) {\n      nodes {\n        ... on CartLine {\n          id\n          quantity\n          cost {\n            amountPerQuantity {\n              ...MoneyFields\n            }\n            compareAtAmountPerQuantity {\n              ...MoneyFields\n            }\n            totalAmount {\n              ...MoneyFields\n            }\n          }\n          merchandise {\n            ... on ProductVariant {\n              id\n              title\n              availableForSale\n              quantityAvailable\n              weight\n              weightUnit\n              selectedOptions {\n                name\n                value\n              }\n              image {\n                ...ImageFields\n              }\n              price {\n                ...MoneyFields\n              }\n              product {\n                id\n                handle\n                title\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n\n\n  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {\n    cartLinesAdd(cartId: $cartId, lines: $lines) {\n      cart {\n        ...CartFields\n      }\n      userErrors {\n        code\n        field\n        message\n      }\n      warnings {\n        code\n        message\n        target\n      }\n    }\n  }\n": {return: CartLinesAddMutation, variables: CartLinesAddMutationVariables},
  "#graphql\n  #graphql\n  fragment MoneyFields on MoneyV2 {\n    amount\n    currencyCode\n  }\n\n  #graphql\n  fragment ImageFields on Image {\n    url\n    altText\n    width\n    height\n  }\n\n  #graphql\n  fragment CartFields on Cart {\n    id\n    checkoutUrl\n    totalQuantity\n    createdAt\n    updatedAt\n    cost {\n      subtotalAmount {\n        ...MoneyFields\n      }\n      totalAmount {\n        ...MoneyFields\n      }\n      subtotalAmountEstimated\n      totalAmountEstimated\n    }\n    lines(first: 100) {\n      nodes {\n        ... on CartLine {\n          id\n          quantity\n          cost {\n            amountPerQuantity {\n              ...MoneyFields\n            }\n            compareAtAmountPerQuantity {\n              ...MoneyFields\n            }\n            totalAmount {\n              ...MoneyFields\n            }\n          }\n          merchandise {\n            ... on ProductVariant {\n              id\n              title\n              availableForSale\n              quantityAvailable\n              weight\n              weightUnit\n              selectedOptions {\n                name\n                value\n              }\n              image {\n                ...ImageFields\n              }\n              price {\n                ...MoneyFields\n              }\n              product {\n                id\n                handle\n                title\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n\n\n  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {\n    cartLinesUpdate(cartId: $cartId, lines: $lines) {\n      cart {\n        ...CartFields\n      }\n      userErrors {\n        code\n        field\n        message\n      }\n      warnings {\n        code\n        message\n        target\n      }\n    }\n  }\n": {return: CartLinesUpdateMutation, variables: CartLinesUpdateMutationVariables},
  "#graphql\n  #graphql\n  fragment MoneyFields on MoneyV2 {\n    amount\n    currencyCode\n  }\n\n  #graphql\n  fragment ImageFields on Image {\n    url\n    altText\n    width\n    height\n  }\n\n  #graphql\n  fragment CartFields on Cart {\n    id\n    checkoutUrl\n    totalQuantity\n    createdAt\n    updatedAt\n    cost {\n      subtotalAmount {\n        ...MoneyFields\n      }\n      totalAmount {\n        ...MoneyFields\n      }\n      subtotalAmountEstimated\n      totalAmountEstimated\n    }\n    lines(first: 100) {\n      nodes {\n        ... on CartLine {\n          id\n          quantity\n          cost {\n            amountPerQuantity {\n              ...MoneyFields\n            }\n            compareAtAmountPerQuantity {\n              ...MoneyFields\n            }\n            totalAmount {\n              ...MoneyFields\n            }\n          }\n          merchandise {\n            ... on ProductVariant {\n              id\n              title\n              availableForSale\n              quantityAvailable\n              weight\n              weightUnit\n              selectedOptions {\n                name\n                value\n              }\n              image {\n                ...ImageFields\n              }\n              price {\n                ...MoneyFields\n              }\n              product {\n                id\n                handle\n                title\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n\n\n  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {\n    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {\n      cart {\n        ...CartFields\n      }\n      userErrors {\n        code\n        field\n        message\n      }\n      warnings {\n        code\n        message\n        target\n      }\n    }\n  }\n": {return: CartLinesRemoveMutation, variables: CartLinesRemoveMutationVariables},
}
declare module '@shopify/storefront-api-client' {
  type InputMaybe<T> = StorefrontTypes.InputMaybe<T>;
  interface StorefrontQueries extends GeneratedQueryTypes {}
  interface StorefrontMutations extends GeneratedMutationTypes {}
}
