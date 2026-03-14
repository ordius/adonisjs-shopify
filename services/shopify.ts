import {
  InvalidJwtError,
  shopifyApi,
  type Shopify as ShopifyApi,
  type ConfigParams,
  type RequestReturn,
  type ShopifyRestResources,
} from '@shopify/shopify-api'
import '@shopify/shopify-api/adapters/node'
import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import { SHOPIFY } from '../src/constants/shopify.js'
import { Scope } from '../src/scope.js'
import type { TPlanGroup, TPlanName, TShopifyPlan } from '../src/types/plan.js'
import type { ShopifyConfig } from '../src/index.js'
import type {
  FutureFlagOptions,
  ShopifyAppCredentials,
  TShopifyGResource,
  ShopifyGqlResult,
} from '../src/types/index.js'

class ShopifyService<
  Params extends ConfigParams<Resources, Future>,
  Resources extends ShopifyRestResources,
  Future extends FutureFlagOptions,
> {
  #config: ShopifyConfig<Params, Resources, Future>
  #apiInstance: { [apiKey: string]: ShopifyApi<Params, Resources, Future> } = {}

  constructor(shopifyConfig: ShopifyConfig<Params, Resources, Future>) {
    this.#config = shopifyConfig
  }

  api(
    config: ShopifyConfig<Params, Resources, Future> = this.#config
  ): ShopifyApi<Params, Resources, Future> {
    const apiKey = config.app.apiKey!
    if (!this.#apiInstance[apiKey]) {
      this.#apiInstance[apiKey] = shopifyApi<Params, Resources, Future>(config.app)
    }

    return this.#apiInstance[apiKey]
  }

  helper(config = this.#config) {
    const plans: TShopifyPlan[] = [
      ...Object.values(SHOPIFY.PLAN.REST),
      ...Object.values(SHOPIFY.PLAN.GQL),
    ]

    return {
      // ...this.api().utils,
      scope: new Scope(config.app.scopes),
      plan: {
        /**
         * Get all or filtered plans.
         *
         * @param {string} keyword - The keyword to filter by.
         * @return {TShopifyPlan[]} An array of Shopify plans.
         */
        get: (keyword?: string): TShopifyPlan[] =>
          plans.filter((p) => (keyword ? p.name.includes(keyword) : p)),

        /**
         * Get all plan names.
         *
         * @param {string} keyword - The keyword to filter by.
         * @return {TShopifyPlan[]} An array of Shopify plans.
         */
        getNames: (keyword?: string): TPlanName[] =>
          plans.filter((p) => (keyword ? p.name.includes(keyword) : p)).map((p) => p.name),

        /**
         * Get plan names by group.
         *
         * @param {TPlanGroup} group - The group to filter the plans by.
         * @return {TShopifyPlan[]} An array of Shopify plans.
         */
        getNamesByGroup: <G extends TPlanGroup>(group: G): TPlanName[] =>
          plans
            .filter((p) => (group ? (p.groups as unknown as TPlanGroup[]).includes(group) : p))
            .map((p) => p.name),
      },

      webhooks(group: 'rest' | 'graphql' = 'graphql'): { address: string; topic: string }[] {
        return Object.entries(config.webhooks ?? []).map(([topic, routePath]) => ({
          address: routePath as string,
          topic: group === 'graphql' ? topic.replace('/', '_').toUpperCase() : topic,
        }))
      },

      id2Gid(resourceKey: TShopifyGResource | string, id: number | string): string {
        return `gid://shopify/${resourceKey}/${id}`
      },

      gid2Id(graphQlId: string): string {
        try {
          const id = `/${graphQlId}`
          const matches = /\/(\w[\w-]*)(?:\?(.*))?$/.exec(id)
          if (matches && matches[1] !== undefined) {
            return matches[1]
          }
        } catch {}
        return graphQlId
      },

      /**
       * Constructs a Shopify GraphQL query string based on the provided parameters.
       *
       * @param {string | null} q - The query term. If null, returns the string 'null'.
       * @param {string | null} [field] - An optional field to prepend to the query term.
       * @param {boolean} [cursor=false] - A flag indicating whether to exclude the wildcard (*) from the query.
       * @return {string} The constructed GraphQL query string.
       */
      gqlQueryFactory(q: string | null, field?: string | null, cursor: boolean = false): string {
        if (!q) {
          return 'null'
        }

        if (!field && !cursor) {
          return `"${q}*"`
        }

        if (!field && cursor) {
          return `"${q}"`
        }

        return `"${field}:${q}*"`
      },

      /**
       * Paginates through a graph data set and formats each item using a provided function.
       *
       * @param data - The graph data set to paginate through.
       * @param fn - Optional. The function used to format each item.
       * @return A promise that resolves to the paginated data set.
       */
      async gqlPaginate<
        Node extends Record<string, any>,
        Input extends RequestReturn<ShopifyGqlResult<Node, 'edges' | 'nodes'>>['body'],
        Data = Input extends { nodes: (infer N)[] }
          ? N
          : Input extends { edges: { node: infer E }[] }
            ? E
            : never,
        Output = Data,
      >(
        data: Input,
        fn?: (item: Data, ...param: any) => Promise<Output> | Output
      ): Promise<{
        items: Output[]
        meta: { next_cursor?: string | null; previous_cursor?: string | null }
      }> {
        const result: {
          items: Output[]
          meta: { next_cursor?: string | null; previous_cursor?: string | null }
        } = {
          items: [],
          meta: {
            next_cursor: data.pageInfo?.hasNextPage ? data.pageInfo?.endCursor : null,
            previous_cursor: data.pageInfo?.hasPreviousPage ? data.pageInfo?.startCursor : null,
          },
        }

        const nodes = (data as RequestReturn<ShopifyGqlResult<Node, 'nodes'>>['body']).nodes
        const edges = (data as RequestReturn<ShopifyGqlResult<Node, 'edges'>>['body']).edges?.map(
          (i) => i.node
        )
        for (const node of nodes ?? edges ?? []) {
          result.items.push(fn ? await fn(node as unknown as Data) : (node as unknown as Output))
        }

        return result
      },

      /**
       * Gen signature from array $params
       * @param {Record<string, any>} requestParams
       * @param {Pick<ShopifyAppCredentials, 'api_secret'>} shopifyApp
       */
      generateSignature(
        requestParams: Record<string, any>,
        shopifyApp: Pick<ShopifyAppCredentials, 'api_secret'>
      ): string {
        const { api_secret: apiSecretKey } = shopifyApp
        const queryString = new URLSearchParams(requestParams).toString()
        return crypto.createHmac('sha256', apiSecretKey).update(queryString).digest('hex')
      },

      /**
       * Get the list of Shopify apps used in the application, including the main app.
       *
       * This function returns a list of Shopify app configurations, including the main app,
       * that is used for verification of signatures in the middleware.
       *
       * @return {ShopifyAppCredentials[]} The list of Shopify app configurations.
       */
      getUsedApps(): ShopifyAppCredentials[] {
        // Set usedApps from extra apps without the current main app
        const usedApps = config.trusted_apps?.filter((a) => a.api_key !== config.app.apiKey) ?? []

        // Add the current main app at the beginning of the list for faster validation on mainstream using
        usedApps.unshift({ api_key: config.app.apiKey!, api_secret: config.app.apiSecretKey })

        return usedApps
      },

      /**
       * Get the used app by API key or secret.
       *
       * This function searches through the list of used Shopify apps to find an app
       * that matches the provided API key or secret.
       * @param {string} apiKeyOrSecret - The API key or secret to search for.
       */
      getUsedApp(apiKeyOrSecret: string): ShopifyAppCredentials | undefined {
        return this.getUsedApps().find(
          (a) => a.api_key === apiKeyOrSecret || a.api_secret === apiKeyOrSecret
        )
      },

      /**
       * Verifies the provided signature to detect which app was used.
       *
       * This function checks the provided signature against a list of apps (including the main app),
       * to determine which app's secret was used to create the signature. It first prepares a payload
       * from the query parameters excluding the signature, and then iterates through the list of apps,
       * checking the HMAC of the payload against the provided signature.
       *
       * This usually is used for webhook/app proxy verification.
       *
       * @param queryParams - The query parameters including the signature to be verified.
       * @param shopifyApps - Optional. An array of Shopify app credentials.
       * @returns The app configuration of the app whose secret matches the signature, or undefined if no match is found.
       */
      verifySignatureThroughApps(
        queryParams: { signature: string } & Record<string, string>,
        shopifyApps?: ShopifyAppCredentials[]
      ) {
        const { signature, ...restQueryParams } = queryParams
        const payload = Object.entries(restQueryParams)
          .sort()
          .map(([k, v]) => `${k}=${v}`)
          .join('')
        const usedApps = shopifyApps ?? this.getUsedApps()

        return usedApps.find(
          (a) =>
            signature === crypto.createHmac('sha256', a.api_secret).update(payload).digest('hex')
        )
      },

      /**
       * Get verified Shopify payload through multi apps
       * @param {string} bearerToken - The bearer token to be verified.
       * @param {object} params - An object containing optional parameters.
       * @param {boolean} params.checkAudience - A flag indicating whether to check the audience (API key) in the payload.
       * @param {ShopifyAppCredentials[]} params.shopifyApps - An array of Shopify app credentials.
       */
      getPayloadThroughApps(
        bearerToken: string,
        params: { checkAudience?: boolean; shopifyApps?: ShopifyAppCredentials[] }
      ) {
        const { shopifyApps = this.getUsedApps(), checkAudience = true } = params
        let payload: ShopifySessionTokenPayload | undefined
        let error: InvalidJwtError | undefined
        for (const shopifyApp of shopifyApps) {
          try {
            payload = jwt.verify(bearerToken, shopifyApp.api_secret) as ShopifySessionTokenPayload

            // The exp and nbf fields are validated by the JWT library
            if (!checkAudience || (checkAudience && payload.aud === shopifyApp.api_key)) {
              return { payload, app: shopifyApp }
            }
            error = new InvalidJwtError('Session token had invalid API key')
          } catch (subError) {
            switch (true) {
              case subError instanceof jwt.JsonWebTokenError:
                error = new InvalidJwtError('Session token had invalid signature')
                break
              case subError instanceof jwt.NotBeforeError:
                error = new InvalidJwtError('Session token had expired')
                break
              case subError instanceof jwt.TokenExpiredError:
                error = new InvalidJwtError('Session token had expired')
                break
              default:
                error = new InvalidJwtError('Session token had invalid signature')
            }
          }
        }

        return { payload, error }
      },
    }
  }
}

export default ShopifyService

/**
 * Shopify's session token.
 * @see https://shopify.dev/docs/apps/build/authentication-authorization/session-tokens
 */
type ShopifySessionTokenPayload = {
  iss: `https://${string}.myshopify.com/admin` // The shop's admin domain. i.e: "https://my-store.myshopify.com/admin"
  dest: `https://${string}.myshopify.com` // The shop's domain. i.e: "https://my-store.myshopify.com"
  aud: string // The client ID (app key) of the receiving app. i.e: "e9b5078c30dfd6cb5a39d5e1ddd83943"
  sub: `${number}` // The `User` that the session token is intended for. i.e: "98196029732"
  exp: number // When the session token expires. i.e: 1719620172
  nbf: number // When the session token activates. i.e: 1719620112
  iat: number // When the session token was issued. i.e: 1719620112
  jti: string // A secure random UUID. i.e: "96daf281-c175-4f68-9ea9-4a1fac0bd6c7"
  sid: string // A unique session ID per user and app. i.e: "905420b6-97d5-4c56-9c77-b5bfd08edf42"
  sig: string // Shopify signature. i.e: "c6e3c3b86fd928344b50c6d5e8def2e170ef699eb634ebcb973d55f1bd949f83"
}
