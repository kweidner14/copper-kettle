import {
  SHOPIFY_STORE_DOMAIN,
  SHOPIFY_STOREFRONT_API_VERSION,
  SHOPIFY_STOREFRONT_PRIVATE_TOKEN,
} from 'astro:env/server'

/**
 * Low-level Storefront API transport.
 *
 * Two things here are load-bearing and easy to get wrong:
 *
 * 1. The token is imported from `astro:env/server`. It is declared in
 *    astro.config.mjs as `access: 'secret'`, so importing this module from
 *    anything that ships to the browser is a *build error*, not a silent leak.
 *    That is the whole reason cart mutations get proxied through Astro API
 *    endpoints instead of being called from the client.
 *
 * 2. A *private* token uses the `Shopify-Storefront-Private-Token` header —
 *    NOT `X-Shopify-Storefront-Access-Token`, which is for public tokens.
 *    Private tokens additionally require `Shopify-Storefront-Buyer-IP`; without
 *    it Shopify throttles on the server's IP (so every visitor shares one
 *    bucket) and bot protection at checkout degrades.
 *
 * Types come from ./types/storefront.generated.d.ts via explicit generics.
 * The preset also emits a `declare module '@shopify/storefront-api-client'`
 * block for its own client package, which this project does not use.
 */

const API_URL = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_STOREFRONT_API_VERSION}/graphql.json`

/** A single error entry from a GraphQL response. */
export interface GraphQLResponseError {
  message: string
  path?: (string | number)[]
  extensions?: Record<string, unknown>
}

export class StorefrontError extends Error {
  readonly status: number
  readonly errors: GraphQLResponseError[]
  readonly operation: string | undefined

  constructor(
    message: string,
    options: { status: number; errors?: GraphQLResponseError[]; operation?: string },
  ) {
    super(message)
    this.name = 'StorefrontError'
    this.status = options.status
    this.errors = options.errors ?? []
    this.operation = options.operation
  }
}

export interface StorefrontRequestInit<TVariables> {
  variables?: TVariables
  /**
   * The end user's IP, forwarded as `Shopify-Storefront-Buyer-IP`.
   * Get it from `getBuyerIp()` rather than constructing it by hand.
   */
  buyerIp?: string | undefined
  signal?: AbortSignal
}

/** Pulls the operation name out of a document, for error messages only. */
function operationNameOf(query: string): string | undefined {
  return /\b(?:query|mutation)\s+(\w+)/.exec(query)?.[1]
}

/**
 * Resolves the real client IP for `Shopify-Storefront-Buyer-IP`.
 *
 * On Cloudflare, `cf-connecting-ip` is set by the edge and cannot be spoofed by
 * the client, so it is the only header trusted outright. `x-forwarded-for` is
 * client-writable and used solely as a local-dev fallback.
 */
export function getBuyerIp(context: {
  request: Request
  clientAddress?: string
}): string | undefined {
  const cfIp = context.request.headers.get('cf-connecting-ip')
  if (cfIp) return cfIp

  try {
    if (context.clientAddress) return context.clientAddress
  } catch {
    // `Astro.clientAddress` throws on adapters/routes that cannot resolve it.
  }

  const forwarded = context.request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || undefined
}

/**
 * Executes one GraphQL document against the Storefront API.
 *
 * Retries once on 429 and 5xx — the Storefront API is throttled on query *cost*,
 * not request count, so a burst of expensive queries can trip it transiently.
 */
export async function storefront<TData, TVariables = Record<string, never>>(
  query: string,
  init: StorefrontRequestInit<TVariables> = {},
): Promise<TData> {
  const operation = operationNameOf(query)

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Shopify-Storefront-Private-Token': SHOPIFY_STOREFRONT_PRIVATE_TOKEN,
  }

  if (init.buyerIp) {
    headers['Shopify-Storefront-Buyer-IP'] = init.buyerIp
  } else if (import.meta.env.DEV) {
    console.warn(
      `[shopify] ${operation ?? 'query'} sent without Shopify-Storefront-Buyer-IP. ` +
        'Fetch through createShopifyApi(Astro) so the client IP is forwarded.',
    )
  }

  const body = JSON.stringify({ query, variables: init.variables ?? {} })

  let response: Response | undefined
  for (let attempt = 0; attempt < 2; attempt++) {
    response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body,
      signal: init.signal,
    })

    if (response.ok || (response.status !== 429 && response.status < 500)) break
    if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 500))
  }

  if (!response) {
    throw new StorefrontError('Storefront request produced no response', {
      status: 0,
      operation,
    })
  }

  if (!response.ok) {
    // Read as text: throttle and auth failures are not always JSON.
    const detail = await response.text().catch(() => '')
    throw new StorefrontError(
      `Storefront API responded ${response.status} for ${operation ?? 'query'}${
        detail ? `: ${detail.slice(0, 500)}` : ''
      }`,
      { status: response.status, operation },
    )
  }

  const payload = (await response.json()) as {
    data?: TData
    errors?: GraphQLResponseError[]
  }

  // A 200 with an `errors` array is the normal GraphQL failure mode.
  if (payload.errors?.length) {
    throw new StorefrontError(
      `Storefront API returned errors for ${operation ?? 'query'}: ${payload.errors
        .map((error) => error.message)
        .join('; ')}`,
      { status: response.status, errors: payload.errors, operation },
    )
  }

  if (!payload.data) {
    throw new StorefrontError(`Storefront API returned no data for ${operation ?? 'query'}`, {
      status: response.status,
      operation,
    })
  }

  return payload.data
}
