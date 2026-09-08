// Domain aliases over the codegen output, so the rest of the app never has to
// spell out `NonNullable<ProductQuery['product']>` or reach into ./types/.
// Regenerate the underlying types with `npm run codegen -w apps/web`.
import type {
  CollectionQuery,
  CollectionsQuery,
  ProductCardFieldsFragment,
  ProductQuery,
  ProductsQuery,
  ProductVariantFieldsFragment,
  ImageFieldsFragment,
  MoneyFieldsFragment,
  PageInfoFieldsFragment,
} from './types/storefront.generated'

export type Money = MoneyFieldsFragment
export type ShopImage = ImageFieldsFragment
export type PageInfo = PageInfoFieldsFragment

export type ProductCard = ProductCardFieldsFragment
export type Product = NonNullable<ProductQuery['product']>
export type ProductVariant = ProductVariantFieldsFragment
export type ProductOption = Product['options'][number]
export type ProductOptionValue = ProductOption['optionValues'][number]

export type Collection = NonNullable<CollectionQuery['collection']>
export type CollectionSummary = CollectionsQuery['collections']['nodes'][number]

/** One page of product cards plus its cursors. */
export interface ProductPage {
  products: ProductCard[]
  pageInfo: PageInfo
}

export type { ProductsQuery, ProductQuery, CollectionQuery, CollectionsQuery }
