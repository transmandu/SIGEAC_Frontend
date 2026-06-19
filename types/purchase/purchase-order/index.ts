import type { Unit, Location, BankAccount, Card, ShippingAgency } from '@/types';
import type { ArticleRequisitionOrderRef, GeneralArticleRequisitionOrderRef } from '@/types/purchase/quote';

// ── Purchase order status ───────────────────────────────────────────────────
export type PurchaseOrderStatus = 'PENDIENTE' | 'PAGADA' | 'COMPLETADA';

// ── Quote article snapshot nested under an article_purchase_order ──────────
export interface PurchaseOrderArticleQuoteOrder {
  id: number;
  quote_order_id: number;
  article_requisition_order_id: number;
  vendor_id?: number | null;
  location_id?: number | null;
  condition_id?: number | null;
  unit_id?: number | null;
  reference?: string | null;
  lead_time?: string | null;
  justification?: string | null;
  is_not_quoted?: boolean;
  quantity: string | number;
  unit_price: string | number;
  article_requisition_order: ArticleRequisitionOrderRef | null;
}

export interface PurchaseOrderGeneralArticleQuoteOrder {
  id: number;
  quote_order_id: number;
  general_article_requisition_order_id: number;
  location_id?: number | null;
  unit_id?: number | null;
  quantity: string | number;
  unit_price: string | number;
  brand_model?: string | null;
  reference?: string | null;
  lead_time?: string | null;
  justification?: string | null;
  is_not_quoted?: boolean;
  general_article_requisition_order: GeneralArticleRequisitionOrderRef | null;
}

/** A line item on a purchase order — tracks shipping for one quoted article. */
export interface PurchaseOrderArticle {
  id: number;
  purchase_order_id: number;
  article_quote_order_id: number;
  shipping_tracking?: string | null;
  international_shipping_tracking?: string | null;
  article_quote_order: PurchaseOrderArticleQuoteOrder | null;
  /** Only present on the `show` (detail) endpoint — resolved from the requisition's matching batch article. */
  unit?: Unit | null;
  /** Only present on the `show` (detail) endpoint — resolved from the requisition's matching batch article. */
  batch?: { id: number; name: string } | null;
}

/** A line item on a purchase order — tracks shipping for one quoted general article. */
export interface PurchaseOrderGeneralArticle {
  id: number;
  purchase_order_id: number;
  general_article_quote_order_id: number;
  shipping_tracking?: string | null;
  international_shipping_tracking?: string | null;
  general_article_quote_order: PurchaseOrderGeneralArticleQuoteOrder | null;
}

export interface PurchaseOrderQuoteRef {
  id: number;
  quote_number: string;
  requisition_order_id?: number;
}

export interface PurchaseOrderRequisitionRef {
  id: number;
  order_number: string;
}

export interface PurchaseOrderVendorRef {
  id: number;
  name: string;
  phone?: string | null;
  address?: string | null;
}

/**
 * A purchase order as returned by the API.
 *
 * Note: `GET index` (list) and `GET show` (detail) return different shapes —
 * `show` runs the response through `formatDataPurchase`, which flattens
 * `justification` from the requisition and resolves `unit`/`batch` on each
 * article. `index` returns the raw Eloquent relations without that step, so
 * `justification`, and `article_purchase_order[].unit`/`batch` may be absent
 * on list rows.
 */
export interface PurchaseOrder {
  id: number;
  order_number: string;
  status: PurchaseOrderStatus;
  /** Only populated by the `show` endpoint, sourced from quote_order.requisition_order.justification. */
  justification?: string | null;
  observation?: string | null;
  purchase_date: string;
  sub_total: number | null;
  total: number | null;
  tax: number | null;
  shipping_fee: number | null;
  international_shipping: number | null;
  wire_fee: number | null;
  handling_fee: number | null;
  invoice?: string | null;
  invoice_number?: string | null;
  created_by: string;
  updated_by?: string | null;
  bank_account?: BankAccount | null;
  card?: Card | null;
  shipping_agency?: ShippingAgency | null;
  vendor: PurchaseOrderVendorRef | null;
  location?: Location;
  quote_order: PurchaseOrderQuoteRef;
  requisition_order?: PurchaseOrderRequisitionRef;
  article_purchase_order: PurchaseOrderArticle[];
  general_article_purchase_order: PurchaseOrderGeneralArticle[];
}

// ── Create purchase order(s) from a quote ───────────────────────────────────
// POST /{company}/purchase-order — splits into one PO per vendor present
// among the selected articles, plus one PO (vendor_id = null) for any
// general articles, all linked to the same quote_order_id.
export interface CreatePurchaseOrderArticleData {
  article_quote_order_id: number;
  shipping_tracking?: string | null;
  international_shipping_tracking?: string | null;
}

export interface CreatePurchaseOrderGeneralArticleData {
  general_article_quote_order_id: number;
  shipping_tracking?: string | null;
  international_shipping_tracking?: string | null;
}

export interface CreatePurchaseOrderData {
  quote_order_id: number;
  location_id: number;
  purchase_date: string;
  observation?: string | null;
  sub_total: number;
  total: number;
  articles_purchase_orders?: CreatePurchaseOrderArticleData[];
  general_articles_purchase_orders?: CreatePurchaseOrderGeneralArticleData[];
}

export interface CreatedPurchaseOrderRef {
  id: number;
  order_number: string;
  status: PurchaseOrderStatus;
  vendor_id: number | null;
}

// ── Update a purchase order's general data + article tracking ──────────────
// PUT /{company}/purchase-order/{id}
export interface UpdatePurchaseOrderArticleData {
  article_purchase_order_id: number;
  shipping_tracking?: string | null;
  international_shipping_tracking?: string | null;
}

export interface UpdatePurchaseOrderData {
  tax?: number | null;
  wire_fee?: number | null;
  handling_fee?: number | null;
  total: number;
  bank_account_id?: number | null;
  card_id?: number | null;
  shipping_fee?: number | null;
  shipping_agency_id?: number | null;
  international_shipping?: number | null;
  invoice_number?: string | null;
  observation?: string | null;
  invoice?: File;
  articles_purchase_orders?: UpdatePurchaseOrderArticleData[];
}
