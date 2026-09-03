import { test } from '@japa/runner'
import crypto from 'node:crypto'
import ShopifyService from '../../services/shopify.js'
import { APP_PROXY_TIMESTAMP_TOLERANCE_SECONDS } from '../../src/constants/shopify.js'
import type { ShopifyAppCredentials } from '../../src/types/index.js'

/**
 * App Proxy signature verification.
 *
 * Two things make this worth pinning: it is the only credential a storefront request carries,
 * and its algorithm is easy to get subtly wrong (repeated parameters, sort order, freshness).
 */
const MAIN: ShopifyAppCredentials = { api_key: 'main-key', api_secret: 'main-secret' }
const TRUSTED: ShopifyAppCredentials = { api_key: 'trusted-key', api_secret: 'trusted-secret' }

function helper(apps: ShopifyAppCredentials[] = [MAIN, TRUSTED]) {
  const [main, ...trusted] = apps
  const service = new ShopifyService({
    app: {
      apiKey: main.api_key,
      apiSecretKey: main.api_secret,
      scopes: [],
      hostName: 'example.com',
    },
    trusted_apps: trusted,
  } as any)

  return service.helper()
}

/** Sign params the way Shopify does, so a test can build a legitimate request. */
function sign(params: Record<string, string | string[]>, secret: string, timestamp: number) {
  const search = new URLSearchParams()
  Object.entries({ ...params, timestamp: String(timestamp) }).forEach(([key, value]) =>
    (Array.isArray(value) ? value : [value]).forEach((v) => search.append(key, v))
  )

  const payload = Array.from(new Set(search.keys()))
    .map((key) => `${key}=${search.getAll(key).join(',')}`)
    .sort()
    .join('')

  search.set('signature', crypto.createHmac('sha256', secret).update(payload).digest('hex'))

  return search.toString()
}

test.group('helper.verifyAppProxySignature', () => {
  test("reproduces Shopify's documented example (secret `hush`)", ({ assert }) => {
    // https://shopify.dev/docs/apps/build/online-store/display-dynamic-data#calculate-a-digital-signature
    const query =
      'extra=1&extra=2&shop=shop-name.myshopify.com&path_prefix=%2Fapps%2Fawesome_reviews&timestamp=1317327555' +
      '&signature=a9718877bea71c2484f91608a7eaea1532bdf71f5c56825065fa4ccabe549ef3'
    const hush: ShopifyAppCredentials = { api_key: 'doc', api_secret: 'hush' }

    // Repeated parameters collapse into one `extra=1,2` pair — the case a parsed-object
    // implementation gets wrong.
    assert.deepEqual(
      helper().verifyAppProxySignature(query, { shopifyApps: [hush], now: 1317327555 }),
      hush
    )
    assert.isUndefined(
      helper().verifyAppProxySignature(query, {
        shopifyApps: [{ api_key: 'x', api_secret: 'shh' }],
        now: 1317327555,
      })
    )
  })

  test('any configured app may have signed it', ({ assert }) => {
    const now = 1_700_000_000
    const query = sign({ shop: 'a.myshopify.com' }, TRUSTED.api_secret, now)

    assert.deepEqual(helper().verifyAppProxySignature(query, { now }), TRUSTED)
    assert.isUndefined(helper([MAIN]).verifyAppProxySignature(query, { now }), 'not one of ours')
  })

  test('a stale timestamp is refused, so a captured URL cannot be replayed', ({ assert }) => {
    const now = 1_700_000_000
    const query = sign({ shop: 'a.myshopify.com' }, MAIN.api_secret, now)

    assert.isDefined(helper().verifyAppProxySignature(query, { now }))
    assert.isDefined(
      helper().verifyAppProxySignature(query, { now: now + APP_PROXY_TIMESTAMP_TOLERANCE_SECONDS })
    )
    assert.isUndefined(
      helper().verifyAppProxySignature(query, {
        now: now + APP_PROXY_TIMESTAMP_TOLERANCE_SECONDS + 1,
      })
    )
    assert.isUndefined(
      helper().verifyAppProxySignature(query, {
        now: now - APP_PROXY_TIMESTAMP_TOLERANCE_SECONDS - 1,
      })
    )
    // Opt out only when the caller checks freshness itself.
    assert.isDefined(
      helper().verifyAppProxySignature(query, { now: now + 86_400, toleranceSeconds: false })
    )
  })

  test('missing or malformed signature and timestamp are refused', ({ assert }) => {
    const now = 1_700_000_000
    const signed = new URLSearchParams(sign({ shop: 'a.myshopify.com' }, MAIN.api_secret, now))

    assert.isUndefined(
      helper().verifyAppProxySignature('shop=a.myshopify.com&timestamp=' + now, { now }),
      'no signature'
    )
    assert.isUndefined(
      helper().verifyAppProxySignature(
        `signature=${signed.get('signature')}&shop=a.myshopify.com`,
        { now }
      ),
      'no timestamp'
    )
    assert.isUndefined(
      helper().verifyAppProxySignature(
        `signature=${signed.get('signature')}&shop=a.myshopify.com&timestamp=soon`,
        { now }
      ),
      'timestamp is not a number'
    )
  })

  test('a tampered or added parameter invalidates the signature', ({ assert }) => {
    const now = 1_700_000_000
    const query = new URLSearchParams(
      sign({ shop: 'a.myshopify.com', product_id: '7' }, MAIN.api_secret, now)
    )

    const tampered = new URLSearchParams(query)
    tampered.set('product_id', '8')
    assert.isUndefined(helper().verifyAppProxySignature(tampered, { now }))

    const injected = new URLSearchParams(query)
    injected.set('logged_in_customer_id', '42')
    assert.isUndefined(helper().verifyAppProxySignature(injected, { now }))
  })
})
