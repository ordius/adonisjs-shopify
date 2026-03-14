![@ordius/adonisjs-shopify](https://socialify.git.ci/ordius/adonisjs-shopify/image?description=1&descriptionEditable=Shopify%20adapter%20for%20AdonisJS.&font=Jost&forks=1&issues=1&logo=https://cdn.shopify.com/shopifycloud/brochure/assets/brand-assets/shopify-logo-shopping-bag-full-color-66166b2e55d67988b56b4bd28b63c271e2b9713358cb723070a92bde17ad7d63.svg&name=1&owner=1&pattern=Charlie%20Brown&pulls=1&stargazers=1&theme=Auto)

# Introduce

This package provides a ready-to-use Shopify REST API client, making it easy to interact with the Shopify API with full TypeScript support and type inference for REST resources.

## Installation

```bash
npm install @ordius/adonisjs-shopify
```

## Setup

### 1. Configure the Package

First, add the package to your AdonisJS project:

```bash
node ace configure @ordius/adonisjs-shopify
```

### 2. Environment Variables

Add your Shopify app credentials to `.env`:

```env
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SHOPIFY_API_VERSION=2025-01
SHOPIFY_HOST_NAME=your-app-domain.com
SHOPIFY_SCOPES=read_products,write_products,read_orders
```

### 3. Provider Registration

The package provider should be automatically registered in `adonisrc.ts`:

```typescript
// adonisrc.ts
export default defineConfig({
  providers: [
    // ... other providers
    () => import('@ordius/adonisjs-shopify/providers/shopify_provider'),
  ],
})
```

### 4. Create Configuration File

Create `config/shopify.ts`:

```typescript
import { defineConfig } from '@ordius/adonisjs-shopify'
import { RestResources } from '@shopify/shopify-api/rest/admin/2025-07'
import env from '#start/env'

// Extend the container types for proper REST resource type inference
declare module '@ordius/adonisjs-shopify/types' {
  interface ShopifyRestResources extends RestResources {}
}

const shopifyConfig = defineConfig({
  /**
   * Shopify configurations
   * @see https://github.com/Shopify/shopify-app-js/blob/main/packages/apps/shopify-api/docs/reference/shopifyApi.md
   */
  app: {
    apiKey: env.get('SHOPIFY_API_KEY'),
    apiSecretKey: env.get('SHOPIFY_API_SECRET'),
    apiVersion: env.get('SHOPIFY_API_VERSION', '2025-01'),
    hostName: env.get('SHOPIFY_HOST_NAME'),
    scopes: env.get('SHOPIFY_SCOPES', '').split(','),
    scopes: env.get('SHOPIFY_API_SCOPES', 'read_products')?.split(','),
    hostScheme: 'https',
    hostName: env.get('SHOPIFY_HOST_NAME'),
    isEmbeddedApp: true,
    isPrivateApp: false,
    // Add other Shopify configuration options as needed
  },

  /**
   * A list of additional Shopify apps (e.g., for development or testing)
   * whose credentials are also accepted when validating requests.
   */
  trusted_app: env.get('SHOPIFY_API_TRUSTED_APPS'),

  /**
   * Defines the Shopify webhook topics that this app should register,
   * along with their corresponding handler URLs.
   */
  webhooks: {
    [SHOPIFY.WEBHOOK_TOPICS.SHOP_UPDATE]: 'https://myapp.com/webhooks/shops/update', // Updates shop information if any change is made from Shopify
    [SHOPIFY.WEBHOOK_TOPICS.APP_UNINSTALLED]: 'https://myapp.com/webhooks/shops/uninstall', // Uninstalls the app
  },
})

export default shopifyConfig
```

### 5. Export Service (Optional)

For easier access across your app, export the service in `start/service.ts`:

```typescript
import app from '@adonisjs/core/services/app'

export const shopify = await app.container.make('shopify')
```

## Usage

#### 1. Container-based Service (Recommended)

```typescript
// In your services/controllers
import { inject } from '@adonisjs/core'
import type { ShopifyService } from '@ordius/adonisjs-shopify/types'

@inject()
export default class ProductService {
  constructor(private shopify: ShopifyService) {}

  async getProducts(session: Session) {
    // Full type inference for Product class
    const products = await this.shopify.api.rest.Product.all({ session })
    return products.data
  }

  async createProduct(session: Session, productData: any) {
    const product = new this.shopify.api.rest.Product({ session })
    product.title = productData.title
    product.body_html = productData.description

    await product.save()
    return product
  }
}
```

#### 2. Direct Service Import

```typescript
// Alternative: Import service directly
import shopify from '@ordius/adonisjs-shopify/services/main'

export default class ShopController {
  async index({ session }: HttpContext) {
    const products = await shopify.api.rest.Product.all({
      session: session.shopifySession,
    })

    return products.data
  }
}
```

## Authentication

### OAuth Flow

```typescript
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class AuthController {
  constructor(private shopify: ShopifyService) {}

  async redirect({ request, response }: HttpContext) {
    const shop = request.input('shop')

    const authUrl = await this.shopify.auth.begin({
      shop,
      callbackPath: '/auth/callback',
      isOnline: false,
    })

    return response.redirect(authUrl)
  }

  async callback({ request, response }: HttpContext) {
    const authResult = await this.shopify.auth.callback({
      rawRequest: request.request,
      rawResponse: response.response,
    })

    if (authResult.session) {
      // Store session and redirect to app
      return response.redirect('/dashboard')
    }

    return response.badRequest('Authentication failed')
  }
}
```

## Webhooks

```typescript
import type { HttpContext } from '@adonisjs/core/http'

export default class WebhookController {
  async handle({ request, response }: HttpContext) {
    try {
      const isValid = await shopify.webhooks.validate({
        rawBody: request.raw(),
        rawRequest: request.request,
      })

      if (!isValid.valid) {
        return response.unauthorized()
      }

      const topic = request.header('x-shopify-topic')
      const payload = request.body()

      // Handle webhook based on topic
      switch (topic) {
        case 'orders/create':
          await this.handleOrderCreate(payload)
          break
        case 'products/update':
          await this.handleProductUpdate(payload)
          break
      }

      return response.ok()
    } catch (error) {
      return response.internalServerError()
    }
  }
}
```

### Benefits

- ✅ Full IntelliSense support for all Shopify REST resources
- ✅ Type-safe API calls with proper parameter validation
- ✅ Auto-completion for methods and properties
- ✅ TypeScript error detection for invalid resources/methods
- ✅ Built-in OAuth authentication flow
- ✅ Webhook validation and handling
- ✅ Session management

### Supported REST Resources

All resources from `@shopify/shopify-api/rest/admin/2025-07`:

- `Product`, `Variant`, `Collection`
- `Customer`, `Order`, `DraftOrder`
- `Inventory`, `Location`, `FulfillmentService`
- `Webhook`, `ScriptTag`, `Asset`
- `Shop`, `Country`, `Province`
- And 60+ more resources with full type support...

## License

MIT
