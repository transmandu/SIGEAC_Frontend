import type { Unit, Location, BankAccount, BankCard, PaymentMethod, ShippingAgency, GeneralArticle, Retailer } from '@/types';
import type { ArticleRequisitionOrderRef, GeneralArticleRequisitionOrderRef } from '@/types/purchase/quote';

// ── Purchase order status ───────────────────────────────────────────────────
export type PurchaseOrderStatus = 'PENDING' | 'PAID' | 'COMPLETED';

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
  /** Comercio / lugar de compra where this general article was quoted. */
  retailer?: Retailer | null;
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
  batch?: { id: number; name: string; category?: string | null } | null;
}

/** A line item on a purchase order — tracks shipping for one quoted general article. */
export interface PurchaseOrderGeneralArticle {
  id: number;
  purchase_order_id: number;
  general_article_quote_order_id: number;
  shipping_tracking?: string | null;
  international_shipping_tracking?: string | null;
  general_article_quote_order: PurchaseOrderGeneralArticleQuoteOrder | null;
  /** Present once someone has registered this line's physical delivery (see registerGeneralArticlesDelivery). Null while still pending. */
  general_article_intake?: { id: number; status: GeneralArticleIntakeStatus } | null;
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
  /** Cómo se pagó la orden: método de pago (con su cuenta y banco), y tarjeta si aplica. */
  payment_method?: PaymentMethod | null;
  bank_account?: BankAccount | null;
  bank_card?: BankCard | null;
  shipping_agency?: ShippingAgency | null;
  vendor: PurchaseOrderVendorRef | null;
  /** Present on general POs — the comercio / lugar de compra this order groups. */
  retailer?: PurchaseOrderVendorRef | null;
  location?: Location;
  quote_order: PurchaseOrderQuoteRef;
  requisition_order?: PurchaseOrderRequisitionRef;
  article_purchase_order: PurchaseOrderArticle[];
  general_article_purchase_order: PurchaseOrderGeneralArticle[];
}

// ── Create purchase order(s) from a quote ───────────────────────────────────
// POST /{company}/purchase-order — splits into one PO per vendor present
// among the selected standard articles, plus one PO per retailer (comercio /
// lugar de compra) present among the selected general articles, all linked to
// the same quote_order_id.
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
  /** El backend deriva bank_account_id del método de pago cuando se envía payment_method_id. */
  payment_method_id?: number | null;
  bank_account_id?: number | null;
  bank_card_id?: number | null;
  shipping_fee?: number | null;
  shipping_agency_id?: number | null;
  international_shipping?: number | null;
  invoice_number?: string | null;
  observation?: string | null;
  invoice?: File;
  articles_purchase_orders?: UpdatePurchaseOrderArticleData[];
}

// ── Register the physical delivery of a PO's general articles ──────────────
// PATCH /{company}/purchase-order/{id}/register-general-articles-delivery
//
// Paying a PO no longer creates inventory for its general articles: the
// person who physically brings the goods must call this endpoint once they
// arrive. It creates one PENDING GeneralArticleIntake per general-article
// line item on the PO that doesn't already have one (safe to call more than
// once on the same PO — e.g. staggered/partial deliveries).
export interface RegisterGeneralArticlesDeliveryResponse {
  message: string;
  general_article_intakes_count: number;
}

// ── General article intakes (staged receiving / verification) ─────────────
// A purchase order's general articles are never written straight into
// general_articles. Registering a delivery (above) creates a PENDING
// GeneralArticleIntake carrying the descriptive fields of what arrived;
// only confirming it (GeneralArticleIntakeController::confirm) creates or
// increments the matching general_articles row. The intake row itself is
// never deleted — it's the permanent audit trail of who/when/how much.
export type GeneralArticleIntakeStatus = 'PENDING' | 'CONFIRMED';

// Shaped by GeneralArticleIntakeResource — only what the frontend needs from
// each relation, not the full purchase_order/quote_order/requisition_order
// or warehouse/unit models.
export interface GeneralArticleIntakePurchaseOrderRef {
  id: number;
  order_number: string;
  quote_order?: {
    id: number;
    quote_number: string;
    requisition_order?: PurchaseOrderRequisitionRef | null;
  } | null;
}

export interface GeneralArticleIntakeUnitRef {
  id: number;
  label: string;
}

export interface GeneralArticleIntakeWarehouseRef {
  location_id: number;
  name: string;
  type: string;
}

// GET /{company}/{location_id}/general-article-intakes
export interface GeneralArticleIntake {
  id: number;
  description: string;
  variant_type?: string | null;
  brand_model?: string | null;
  cost?: number | null;
  image?: string | null;
  quantity: string | number;
  arrived_at: string;
  status: GeneralArticleIntakeStatus;
  registered_by: string;
  confirmed_by?: string | null;
  confirmed_at?: string | null;
  observation?: string | null;
  unit?: GeneralArticleIntakeUnitRef | null;
  warehouse?: GeneralArticleIntakeWarehouseRef | null;
  purchase_order?: GeneralArticleIntakePurchaseOrderRef | null;
}

// GET /{company}/general-article-intakes/{location_id}?status=PENDING|CONFIRMED
export type GetGeneralArticleIntakesParams = {
  status?: GeneralArticleIntakeStatus;
};

// PATCH /{company}/general-article-intakes/{id}/confirm
export interface ConfirmGeneralArticleIntakeResponse {
  message: string;
  intake: GeneralArticleIntake;
  general_article: GeneralArticle;
}
