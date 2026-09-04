/**
 * Payload shapes for the webhook topics an app has to act on rather than merely acknowledge.
 *
 * Only the fields Shopify guarantees and an app actually reads are typed — every payload
 * carries more (`name`, `created_at`, `currency`, …) and Shopify adds fields over time, so
 * these are deliberately open at the edges rather than exhaustive.
 *
 * @see https://shopify.dev/docs/api/webhooks
 */

/**
 * State of an app subscription, as Shopify reports it.
 *
 * @see https://shopify.dev/docs/api/admin-graphql/latest/enums/AppSubscriptionStatus
 */
export type TAppSubscriptionStatus =
  /** Approved by the merchant and billing. */
  | 'ACTIVE'
  /** Ended by the app — an uninstall, a replacement subscription, or a direct cancel. Terminal. */
  | 'CANCELLED'
  /** Declined by the merchant. Terminal. */
  | 'DECLINED'
  /** Not approved within two days of being created. Terminal. */
  | 'EXPIRED'
  /** On hold for non-payment; re-activates when the shop's bill is paid. */
  | 'FROZEN'
  /** Created, awaiting the merchant's approval. */
  | 'PENDING'

/**
 * Body of `app_subscriptions/update` and `app_subscriptions/approaching_capped_amount`.
 *
 * The two topics do **not** share a field set — verified against real deliveries
 * (`shopify app webhook trigger`, API version 2026-04), not the docs:
 * - `update` carries `status`, `price`, `interval`, `plan_handle` and `currency`.
 * - `approaching_capped_amount` carries **no `status`**, adds `balance_used`, and spells the
 *   currency `currency_code`.
 *
 * Money is inconsistent even within one payload: `capped_amount` arrives as a decimal
 * **string** (`"20.0"`) while `balance_used` arrives as a **number** (`0`). Read both with a
 * presence check — `value ? Number(value) : null` turns a real zero balance into "unknown".
 */
export type TAppSubscriptionWebhookPayload = {
  app_subscription?: {
    /** `gid://shopify/AppSubscription/1029266969` */
    admin_graphql_api_id?: string
    /** `gid://shopify/Shop/548380009` */
    admin_graphql_api_shop_id?: string
    name?: string
    /** `update` topic only. */
    status?: TAppSubscriptionStatus
    /** Money; a decimal string in observed deliveries. Both topics. */
    capped_amount?: string | number | null
    /** Money; a **number** in observed deliveries. `approaching_capped_amount` only. */
    balance_used?: string | number | null
    /** Money; `update` topic only. */
    price?: string | number | null
    /** `every_30_days` | `annual`. `update` topic only. */
    interval?: string
    /** Managed-pricing plan handle. `update` topic only. */
    plan_handle?: string
    /** `update` topic. */
    currency?: string
    /** `approaching_capped_amount` topic — same value, different key. */
    currency_code?: string
    created_at?: string
    updated_at?: string
  }
}
