import { ApiType, shopifyApiProject } from '@shopify/api-codegen-preset'

// The API version is pinned in one place and flows into both the schema that
// codegen validates against and the endpoint URL the client calls. If these two
// ever drift you get types that compile against a schema the store isn't serving.
// src/lib/shopify/client.ts reads the same value from SHOPIFY_STOREFRONT_API_VERSION.
const API_VERSION = '2026-04'

export default {
  projects: {
    default: shopifyApiProject({
      apiType: ApiType.Storefront,
      apiVersion: API_VERSION,
      // Every GraphQL document lives under queries/ as a plain `.ts` file.
      // Nothing is inlined in .astro frontmatter — graphql-tag-pluck cannot
      // parse .astro, so an inlined document would silently generate no types.
      documents: ['./src/lib/shopify/queries/**/*.ts'],
      outputDir: './src/lib/shopify/types',
      // Emit enums as string-literal unions rather than TS `enum`s. The output
      // is a .d.ts, so a real enum would be *ambient* — referencing
      // `ProductSortKeys.BestSelling` as a value would type-check and then blow
      // up at runtime, because there is no JS module behind it.
      enumsAsConst: true,
    }),
  },
}
