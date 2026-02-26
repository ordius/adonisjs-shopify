import type { ApplicationService } from '@adonisjs/core/types'
import ShopifyService from '../services/shopify.ts'
import type { FutureFlagOptions, ShopifyAppCredentials, ShopifyConfig } from '../src/types/index.ts'
import type { ConfigParams, ShopifyRestResources } from '@shopify/shopify-api'

export default class ShopifyProvider<
  Params extends ConfigParams<Resources, Future>,
  Resources extends ShopifyRestResources = ShopifyRestResources,
  Future extends FutureFlagOptions = FutureFlagOptions,
> {
  constructor(protected app: ApplicationService) {}

  register() {
    this.app.container.singleton('shopify', async () => {
      const shopifyConfig = this.app.config.get<ShopifyConfig<Params, Resources, Future>>('shopify')
      const service = new ShopifyService(shopifyConfig)
      const apiService = service

      return {
        use: (shopifyApp: ShopifyAppCredentials) => {
          return this.#shopifyService(apiService, {
            ...shopifyConfig,
            app: {
              ...shopifyConfig.app,
              apiKey: shopifyApp.api_key,
              apiSecretKey: shopifyApp.api_secret,
            },
          })
        },
        ...this.#shopifyService(apiService, shopifyConfig),
      }
    })
  }

  async boot() {}

  async start() {}

  async ready() {}

  async shutdown() {}

  #shopifyService(
    service: ShopifyService<Params, Resources, Future>,
    shopifyConfig: ShopifyConfig<Params, Resources, Future>
  ) {
    const shopifyApiInstance = service.api(shopifyConfig)
    const helper = service.helper(shopifyConfig)

    return {
      api: shopifyApiInstance,
      helper: {
        ...helper,
        ...shopifyApiInstance.utils,
      },
    }
  }
}
