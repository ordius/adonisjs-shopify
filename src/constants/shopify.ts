import { SHOPIFY_WEBHOOK_TOPICS } from './webhook.js'

const SHOPIFY_PLAN_GROUP = {
  AI: 'ai',
  STAFF: 'staff',
  UNAVAILABLE: 'unavailable',
  AVAILABLE: 'available',
  ADVANCED: 'advanced',
  TEST: 'test',
  FREE: 'free',
} as const

/** SHOPIFY REST API Known Plans */
const SHOPIFY_REST_API_PLANS = {
  // known plans
  AFFILIATE: {
    name: 'affiliate',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE],
  },
  COMPED: {
    name: 'comped',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE, SHOPIFY_PLAN_GROUP.FREE],
  },

  STARTER: {
    name: 'starter',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE],
  },
  STARTER_2022: {
    name: 'starter_2022',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE],
  },
  STARTER_2022_TRIAL: {
    name: 'starter_2022_trial',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE, SHOPIFY_PLAN_GROUP.FREE],
  },

  BASIC: {
    name: 'basic',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE],
  },
  STANDARD: {
    name: 'standard',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE],
  },
  PROFESSIONAL: {
    name: 'professional',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE, SHOPIFY_PLAN_GROUP.ADVANCED],
  },
  BUSINESS: {
    name: 'business',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE, SHOPIFY_PLAN_GROUP.ADVANCED],
  },
  SHOPIFY_ALUMNI: {
    name: 'shopify_alumni',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE],
  },
  SHOPIFY_PLUS: {
    name: 'shopify_plus',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE, SHOPIFY_PLAN_GROUP.ADVANCED],
  },
  UNLIMITED: {
    name: 'unlimited',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE, SHOPIFY_PLAN_GROUP.ADVANCED],
  },
  CUSTOM: {
    name: 'custom',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE],
  },

  NONPROFIT: {
    name: 'nonprofit',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE],
  },
  NPO_FULL: {
    name: 'npo_full',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE],
  },
  NPO_LITE: {
    name: 'npo_lite',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE],
  },

  SINGTEL_BASIC: {
    name: 'singtel_basic',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE],
  },
  SINGTEL_PROFESSIONAL: {
    name: 'singtel_professional',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE],
  },
  SINGTEL_TRIAL: {
    name: 'singtel_trial',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE, SHOPIFY_PLAN_GROUP.FREE],
  },

  UAFRICA_BASIC: {
    name: 'uafrica_basic',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE],
  },
  UAFRICA_PROFESSIONAL: {
    name: 'uafrica_professional',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE],
  },

  TRIAL: {
    name: 'trial',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE, SHOPIFY_PLAN_GROUP.FREE],
  },
  PAID_TRIAL: {
    name: 'paid_trial',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE],
  },

  STAFF: {
    name: 'staff',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE, SHOPIFY_PLAN_GROUP.TEST, SHOPIFY_PLAN_GROUP.STAFF],
  },
  STAFF_BUSINESS: {
    name: 'staff_business',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE, SHOPIFY_PLAN_GROUP.TEST, SHOPIFY_PLAN_GROUP.STAFF],
  },
  GRANDFATHER: {
    name: 'grandfather',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE, SHOPIFY_PLAN_GROUP.TEST, SHOPIFY_PLAN_GROUP.STAFF],
  },
  GRANDFATHERED: {
    name: 'grandfathered',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE, SHOPIFY_PLAN_GROUP.FREE, SHOPIFY_PLAN_GROUP.STAFF],
  },

  PARTNER_TEST: {
    name: 'partner_test',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE, SHOPIFY_PLAN_GROUP.FREE, SHOPIFY_PLAN_GROUP.TEST],
  },
  PLUS_PARTNER_SANDBOX: {
    name: 'plus_partner_sandbox',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE, SHOPIFY_PLAN_GROUP.FREE, SHOPIFY_PLAN_GROUP.TEST],
  },
  SALES_TRAINING: {
    name: 'sales_training',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE, SHOPIFY_PLAN_GROUP.FREE, SHOPIFY_PLAN_GROUP.TEST],
  },
  OPEN_LEARNING: {
    name: 'open_learning',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE, SHOPIFY_PLAN_GROUP.FREE, SHOPIFY_PLAN_GROUP.TEST],
  },

  CANCELLED: {
    name: 'cancelled',
    groups: [SHOPIFY_PLAN_GROUP.UNAVAILABLE],
  },
  DORMANT: {
    name: 'dormant',
    groups: [SHOPIFY_PLAN_GROUP.UNAVAILABLE],
  },
  FRAUDULENT: {
    name: 'fraudulent',
    groups: [SHOPIFY_PLAN_GROUP.UNAVAILABLE],
  },
  FROZEN: {
    name: 'frozen',
    groups: [SHOPIFY_PLAN_GROUP.UNAVAILABLE],
  },
} as const

/** Possible plan values */
const SHOPIFY_GQL_API_PLANS = {
  /** Public plan: For global reach (in REST api: `unlimited`) */
  ADVANCED: {
    name: 'Advanced',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE, SHOPIFY_PLAN_GROUP.ADVANCED],
  },
  AGENTIC: {
    name: 'Agentic',
    groups: [SHOPIFY_PLAN_GROUP.AI, SHOPIFY_PLAN_GROUP.AVAILABLE],
  },
  /** Public plan: For solo entrepreneurs (in REST api: `basic`) */
  BASIC: {
    name: 'Basic',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE],
  },
  /** In REST api: `partner_test`|`plus_partner_sandbox`|`affiliate`|`staff` */
  DEVELOPMENT: {
    name: 'Development',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE, SHOPIFY_PLAN_GROUP.FREE, SHOPIFY_PLAN_GROUP.TEST],
  },
  /** Public plan: For small teams (in REST api: `professional`) */
  GROW: {
    name: 'Grow',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE],
  },
  /** In REST api: `cancelled`|`fraudulent`|`frozen`|`grandfather`|`grandfathered` */
  INACTIVE: {
    name: 'Inactive',
    groups: [SHOPIFY_PLAN_GROUP.UNAVAILABLE],
  },
  LITE: {
    name: 'Lite',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE],
  },
  /** Custom plan: For unique business needs (in REST api: `custom`) */
  OTHER: {
    name: 'Other',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE],
  },
  /** In REST api: `dormant` */
  PAUSED: {
    name: 'Paused',
    groups: [SHOPIFY_PLAN_GROUP.UNAVAILABLE],
  },
  /** Public plan: For complex businesses (in REST api: `shopify_plus`) */
  PLUS: {
    name: 'Plus',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE, SHOPIFY_PLAN_GROUP.ADVANCED],
  },
  /** Shop in trial when upgrade to `Plus` plan (in REST api: `paid_trial`) */
  PLUS_TRIAL: {
    name: 'Plus Trial',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE],
  },
  /** In REST api: `retail` */
  RETAIL: {
    name: 'Retail',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE],
  },
  SHOP_COMPONENT: {
    name: 'Shop Component',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE],
  },
  SHOPIFY_FINANCE: {
    name: 'Shopify Finance',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE, SHOPIFY_PLAN_GROUP.STAFF],
  },
  /** Hidden plan. (in REST api: `staff`) */
  STAFF: {
    name: 'Staff',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE, SHOPIFY_PLAN_GROUP.TEST, SHOPIFY_PLAN_GROUP.STAFF],
  },
  /** In REST api: `staff_business` */
  STAFF_BUSINESS: {
    name: 'Staff Business',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE, SHOPIFY_PLAN_GROUP.TEST, SHOPIFY_PLAN_GROUP.STAFF],
  },
  /** In REST api: `starter_2022`|etc. */
  STARTER: {
    name: 'Starter',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE],
  },
  /** Shop with new charge any plan (In REST api: `trial`) */
  TRIAL: {
    name: 'Trial',
    groups: [SHOPIFY_PLAN_GROUP.AVAILABLE, SHOPIFY_PLAN_GROUP.FREE],
  },
} as const

/**
 * How far an App Proxy `timestamp` may sit from the app's clock before the request is
 * refused. Shopify signs at forward time, so a legitimate request is never older than the
 * hop; the window only absorbs clock skew. Matches the clock tolerance
 * `@shopify/shopify-api` applies to its own HMAC validation, so the two never disagree on
 * the same request.
 */
export const APP_PROXY_TIMESTAMP_TOLERANCE_SECONDS = 90

export const SHOPIFY = {
  APP_PROXY: {
    TIMESTAMP_TOLERANCE_SECONDS: APP_PROXY_TIMESTAMP_TOLERANCE_SECONDS,
  },
  RESOURCE: {
    // support resource
    PRODUCT: 'product',
  },
  WEBHOOK_TOPICS: SHOPIFY_WEBHOOK_TOPICS,
  GRAPH: {
    RESOURCE: {
      PRODUCT: 'Product',
      COLLECTION: 'Collection',
    },
    QUERY: {
      RESOURCE: {
        PRODUCT: 'products',
        TAG: 'tags',
      },
    },
  },
  PLAN: {
    GROUP: SHOPIFY_PLAN_GROUP,
    GQL: SHOPIFY_GQL_API_PLANS,
    REST: SHOPIFY_REST_API_PLANS,
  },
} as const

// const knownPlans = [
//   'affiliate', 'basic', 'business', 'cancelled', 'comped', 'custom', 'dormant', 'fraudulent',
//   'frozen', 'grandfather', 'nonprofit', 'npo_full', 'npo_lite', 'open_learning', 'paid_trial',
//   'partner_test', 'professional', 'shopify_alumni', 'shopify_plus', 'sales_training',
//   'singtel_basic', 'singtel_professional', 'singtel_trial', 'staff', 'staff_business',
//   'standard', 'starter', 'starter_2022', 'starter_2022_trial', 'trial', 'uafrica_basic',
//   'uafrica_professional', 'unlimited', 'plus_partner_sandbox', 'grandfathered'
// ];
