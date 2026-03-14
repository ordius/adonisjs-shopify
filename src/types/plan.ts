import { type SHOPIFY } from '../constants/shopify.js'

export type TShopifyPlan =
  | (typeof SHOPIFY.PLAN.REST)[keyof typeof SHOPIFY.PLAN.REST]
  | (typeof SHOPIFY.PLAN.GQL)[keyof typeof SHOPIFY.PLAN.GQL]
export type TPlanGroup = (typeof SHOPIFY.PLAN.GROUP)[keyof typeof SHOPIFY.PLAN.GROUP]
export type TPlanName = TShopifyPlan['name']
