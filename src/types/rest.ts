import type ShopifyProvider from '../../providers/shopify_provider.ts'
import type { Session, ApiVersion, ShopifyClients } from '@shopify/shopify-api'
import type { ShopifyRestResources } from './index.ts'

type ShopifyRestInstances<Resources extends ShopifyRestResources> = {
  [K in keyof Resources]: InstanceType<Resources[K]>
}

export interface Shopify extends ShopifyRestInstances<ShopifyRestResources> {
  ShopifyProvider: typeof ShopifyProvider
  Session: Session
  ApiVersion: ApiVersion
  RestResources: ShopifyRestResources
  RestClient: ShopifyClients['Rest']
  GraphqlClient: ShopifyClients['Graphql']
  StorefrontClient: ShopifyClients['Storefront']
}
