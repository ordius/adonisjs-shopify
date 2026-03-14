/*
 * @ordius/adonisjs-shopify
 *
 * (c) Mixxtor
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import app from '@adonisjs/core/services/app'
import type { ConfigParams } from '@shopify/shopify-api'
import type { ShopifyServiceContract, ShopifyRestResources } from '../src/types/index.js'
import type { FutureFlagOptions } from '../src/types/index.js'

// Use the augmented `ShopifyRestResources` interface
let shopify: ShopifyServiceContract<
  ConfigParams<ShopifyRestResources, FutureFlagOptions>,
  ShopifyRestResources,
  FutureFlagOptions
>

await app.booted(async () => {
  shopify = await app.container.make('shopify')
})

export { shopify as default }
