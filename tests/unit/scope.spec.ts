import { test } from '@japa/runner'
import { Scope } from '../../src/scope.js'

/**
 * `Scope#has` / `Scope#missing` delegate to `AuthScopes` from `@shopify/shopify-api`, which
 * expands implied scopes (`write_x` ⇒ `read_x`) on both sides. `equals()` does not, and its
 * quirky (deprecated) behaviour is pinned here too so the JSDoc warning stays true.
 */
test.group('Scope#has / Scope#missing', () => {
  test('a compressed write_x covers its implied read_x', ({ assert }) => {
    const scope = new Scope(['write_products'])

    assert.isTrue(scope.has('read_products'))
    assert.isTrue(scope.has('write_products'))
    assert.isFalse(scope.has('write_orders'))
  })

  test('the unauthenticated_ variant implies its own read counterpart only', ({ assert }) => {
    const scope = new Scope(['unauthenticated_write_checkouts'])

    assert.isTrue(scope.has('unauthenticated_read_checkouts'))
    assert.isFalse(scope.has('read_checkouts'), 'not the authenticated scope family')
  })

  test('accepts a comma-separated string or an array interchangeably', ({ assert }) => {
    const scope = new Scope('read_products,write_orders')

    assert.isTrue(scope.has('read_products,write_orders'))
    assert.isTrue(scope.has(['read_products', 'read_orders']))
  })

  test('whitespace around scopes is trimmed', ({ assert }) => {
    const scope = new Scope([' read_products ', ' write_orders '])

    assert.isTrue(scope.has(' read_products , read_orders '))
  })

  test('extra granted scopes do not affect coverage', ({ assert }) => {
    const scope = new Scope(['read_products', 'write_orders', 'read_customers'])

    assert.isTrue(scope.has(['read_products', 'read_orders']))
  })

  test('an empty current set covers nothing', ({ assert }) => {
    const scope = new Scope()

    assert.isFalse(scope.has('read_products'))
    assert.deepEqual(scope.missing('read_products'), ['read_products'])
  })

  test('missing() returns only the uncovered scopes, trimmed, deduped, in input order', ({
    assert,
  }) => {
    const scope = new Scope(['write_products'])

    assert.deepEqual(
      scope.missing([' read_orders ', 'write_products', 'read_orders', 'read_products']),
      ['read_orders']
    )
  })

  test('missing() treats a bare read_x as covered when write_x is granted', ({ assert }) => {
    const scope = new Scope(['write_products'])

    assert.deepEqual(scope.missing('read_products'), [])
  })
})

test.group('Scope#equals (deprecated)', () => {
  test('returns true — meaning "differs" — for an up-to-date but compressed grant', ({
    assert,
  }) => {
    const scope = new Scope(['write_products'])

    // Same effective access, spelled compressed like Shopify reports granted scopes — equals()
    // still flags it because it checks its own scope implied from the argument against the
    // argument's un-expanded set.
    assert.isTrue(scope.equals('write_products'))
  })

  test('returns false only when the argument spells out every implied scope too', ({ assert }) => {
    const scope = new Scope(['write_products'])

    assert.isFalse(scope.equals(['write_products', 'read_products']))
  })

  test('returns true when the sets actually differ', ({ assert }) => {
    const scope = new Scope(['read_products'])

    assert.isTrue(scope.equals('read_orders'))
  })
})
