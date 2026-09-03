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
 * `capped_amount` and `balance_used` are money values, which Shopify serializes as decimal
 * **strings** — parse them, do not compare them.
 */
export type TAppSubscriptionWebhookPayload = {
  app_subscription?: {
    /** `gid://shopify/AppSubscription/1029266969` */
    admin_graphql_api_id?: string
    /** `gid://shopify/Shop/548380009` */
    admin_graphql_api_shop_id?: string
    name?: string
    status?: TAppSubscriptionStatus
    /** Only on the capped-amount topic. */
    capped_amount?: string | number | null
    /** Only on the capped-amount topic. */
    balance_used?: string | number | null
    currency?: string
    created_at?: string
    updated_at?: string
  }
}
