import { AuthScopes } from '@shopify/shopify-api'

/**
 * A set of Shopify access scopes, with implied scopes (`write_x` ⇒ `read_x`,
 * `unauthenticated_write_x` ⇒ `unauthenticated_read_x`) understood.
 *
 * `shopify.helper.scope` (built from `config.app.scopes` in `services/shopify.ts`) holds the
 * **configured** app scopes, not a shop's granted ones — and it is empty when `scopes` is
 * omitted from the config, as under Shopify managed installation (`shopify.app.toml`'s `scopes`
 * / `optional_scopes` are the source of truth there). To check what a shop has actually granted,
 * build a `Scope` from `currentAppInstallation.accessScopes` instead.
 */
export class Scope {
  private compressedScopes: string[] = []

  constructor(scopes?: AuthScopes | string | string[]) {
    if (typeof scopes === 'string') {
      this.compressedScopes = this.parseString(scopes)
    } else {
      if (scopes) {
        this.compressedScopes = this.normalizeArray(
          Array.isArray(scopes) ? scopes : scopes.toArray()
        )
      }
    }
  }

  /**
   * Parse the input string into an array of strings.
   *
   * @param {string} scopes - the input string to be parsed
   * @return {string[]} the array of parsed strings
   */
  private parseString(scopes: string): string[] {
    return scopes
      .split(',')
      .map((scope) => scope.trim())
      .filter((scope) => scope.length > 0)
  }

  /**
   * Normalize the given array of strings by removing duplicate items and trimming whitespace from each string.
   *
   * @param {string[]} scopes - The array of strings to be normalized
   * @return {string[]} - The normalized array of strings
   */
  private normalizeArray(scopes: string[]): string[] {
    return Array.from(new Set(scopes.map((scope) => scope.trim())))
  }

  /**
   * Retrieves implied scopes based on the input array of scopes.
   *
   * @param {string[]} scopes - The array of scopes to derive implied scopes from
   * @return {string[]} The array of implied scopes
   */
  private getImpliedScopes(scopes: string[]): string[] {
    const impliedScopes: string[] = []
    for (const scope of scopes) {
      if (scope.match(/^(unauthenticated_)?write_(.*)$/)) {
        impliedScopes.push(scope.replace(/^(unauthenticated_)?write_/, '$1read_'))
      }
    }
    return impliedScopes
  }

  /**
   * Set the initial scopes.
   *
   * @param {string | string[]} scopes - The initial scopes
   * @example string format: 'read_products,write_orders';
   *          array format: ['read_products', 'write_orders']
   * @return {this} The updated object
   */
  set(scopes: string | string[]): this {
    if (typeof scopes === 'string') {
      this.compressedScopes = this.parseString(scopes)
    } else {
      this.compressedScopes = this.normalizeArray(scopes)
    }

    return this
  }

  /**
   * Get the compressed old scopes.
   *
   * @return {string[]} the compressed scopes
   */
  getCompressedScopes(): string[] {
    return this.compressedScopes
  }

  /**
   * Compresses the scopes: removes duplicates and non-sense scopes
   *
   * @param {string | string[]} scopes - The scopes to compress
   * @return {string[]} The compressed scopes
   */
  compressScopes(scopes: string | string[]): string[] {
    return typeof scopes === 'string' ? this.parseString(scopes) : this.normalizeArray(scopes)
  }

  /**
   * Checks whether the current set of scopes covers every one of the given scopes, expanding
   * implied scopes on both sides (`write_x` ⇒ `read_x`, `unauthenticated_write_x` ⇒
   * `unauthenticated_read_x`). Delegates to `AuthScopes#has()` from `@shopify/shopify-api` rather
   * than re-implementing implied-scope expansion.
   *
   * @param {string | string[]} scopes - The scope(s) to check for; comma-separated string or array.
   * @return {boolean} `true` when the current set covers all of them.
   */
  has(scopes: string | string[]): boolean {
    return new AuthScopes(this.compressedScopes).has(scopes)
  }

  /**
   * Returns the given scopes that the current set does not cover, expanding implied scopes the
   * same way `has()` does. Useful for reporting exactly what a shop still needs to grant.
   *
   * @param {string | string[]} scopes - The scope(s) to check; comma-separated string or array.
   * @return {string[]} The subset of `scopes` (trimmed, deduped, in input order) that is missing.
   */
  missing(scopes: string | string[]): string[] {
    const current = new AuthScopes(this.compressedScopes)

    return this.compressScopes(scopes).filter((scope) => !current.has(scope))
  }

  /**
   * Checks if the provided scopes are equal to the current scopes.
   *
   * @deprecated Despite the name, this returns `true` when the scope sets **differ**, not when
   * they match — the boolean is inverted relative to what "equals" implies. It also returns
   * `true` whenever `newScopes` spells a `write_x` scope without its implied `read_x` counterpart
   * spelled out too, even when the current set already covers it — it expands **this** set's
   * implied scopes from the argument and checks them against the argument **un-expanded**. Shopify
   * reports granted scopes compressed (`write_products`, no `read_products`), so this flags every
   * up-to-date shop as different. Use `has()` to check coverage or `missing()` to see what's
   * absent — both expand implied scopes on both sides via `AuthScopes#has()`. For real set
   * equality use `AuthScopes#equals()` from `@shopify/shopify-api` directly. Slated for removal
   * in the next major version.
   *
   * @param {string | string[]} newScopes - The new scopes to compare.
   * @return {boolean} `true` when the sets differ (see above) — not the plain-English meaning of "equals".
   */
  equals(newScopes: string | string[]): boolean {
    const newScopeArray =
      typeof newScopes === 'string' ? this.parseString(newScopes) : this.normalizeArray(newScopes)
    const impliedScopes = this.getImpliedScopes(newScopeArray)

    const allScopes = [...this.compressedScopes, ...impliedScopes]
    const newScopeSet = new Set(newScopeArray)

    return !allScopes.every((scope) => newScopeSet.has(scope))
  }
}

// export default new Scope(configer.get('shopify.scopes'));
