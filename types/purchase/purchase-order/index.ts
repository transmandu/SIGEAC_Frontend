import type { Unit, Location, BankAccount, BankCard, PaymentMethod, ShippingAgency, GeneralArticle, Retailer, Vendor } from '@/types';
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
  total: string | number;
  /** Unidad fijada al cotizar — la que hereda el artículo al crearse en inventario. */
  unit?: Unit | null;
  condition?: { id: number; name: string } | null;
  vendor?: Vendor | null;
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
  total: string | number;
  brand_model?: string | null;
  reference?: string | null;
  lead_time?: string | null;
  justification?: string | null;
  is_not_quoted?: boolean;
  /** Comercio / lugar de compra where this general article was quoted. */
  retailer?: Retailer | null;
  /** Unidad fijada al cotizar — la que hereda el artículo al crearse en inventario. */
  unit?: Unit | null;
  general_article_requisition_order: GeneralArticleRequisitionOrderRef | null;
}

/** A line item on a purchase order — tracks shipping for one quoted article. */
export interface PurchaseOrderArticle {
  id: number;
  purchase_order_id: number;
  article_quote_order_id: number;
  /** Actual amount paid for this line item — may differ from article_quote_order.total. */
  total?: string | number | null;
  /** Required (by convention, not enforced by the backend) when total differs from the quoted total. */
  total_justification?: string | null;
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
  /** Actual amount paid for this line item — may differ from general_article_quote_order.total. */
  total?: string | number | null;
  /** Required (by convention, not enforced by the backend) when total differs from the quoted total. */
  total_justification?: string | null;
  shipping_tracking?: string | null;
  international_shipping_tracking?: string | null;
  general_article_quote_order: PurchaseOrderGeneralArticleQuoteOrder | null;
  /** Present once someone has registered this line's physical delivery (see registerGeneralArticlesDelivery). Null while still pending. If status is REJECTED, the line is eligible for re-registration. */
  general_article_intake?: {
    id: number;
    status: GeneralArticleIntakeStatus;
    warehouse?: GeneralArticleIntakeWarehouseRef | null;
    department?: GeneralArticleIntakeDepartmentRef | null;
    employee?: GeneralArticleIntakeEmployeeRef | null;
    third_party?: GeneralArticleIntakeThirdPartyRef | null;
    authorized_employee?: GeneralArticleIntakeAuthorizedEmployeeRef | null;
  } | null;
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
  total?: number | null;
  /** Required (by convention, not enforced by the backend) when total differs from the quoted total. */
  total_justification?: string | null;
  shipping_tracking?: string | null;
  international_shipping_tracking?: string | null;
}

export interface CreatePurchaseOrderGeneralArticleData {
  general_article_quote_order_id: number;
  total?: number | null;
  /** Required (by convention, not enforced by the backend) when total differs from the quoted total. */
  total_justification?: string | null;
  shipping_tracking?: string | null;
  international_shipping_tracking?: string | null;
}

export interface CreatePurchaseOrderData {
  quote_order_id: number;
  location_id: number;
  purchase_date: string;
  observation?: string | null;
  /**
   * Not used by the backend at creation — a quote spanning multiple vendors
   * (or retailers, for general articles) splits into one PO per vendor, and
   * each split PO's sub_total/total is computed server-side as the sum of
   * only the articles routed into it. Kept optional for callers that still
   * pass a value; it's ignored.
   */
  sub_total?: number;
  total?: number;
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
  total?: number | null;
  /** Required (by convention, not enforced by the backend) when total differs from the quoted total. */
  total_justification?: string | null;
  shipping_tracking?: string | null;
  international_shipping_tracking?: string | null;
}

export interface UpdatePurchaseOrderData {
  tax?: number | null;
  wire_fee?: number | null;
  handling_fee?: number | null;
  /** Sum of the line items' totals — recalculate on the frontend whenever an article's total changes. */
  sub_total?: number | null;
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
// REJECTED marks a physical-verification mismatch (wrong item / wrong
// quantity): the intake never touches stock, stays as incident history, and
// the deliverer can re-register the delivery on the same PO once resolved.
// DELIVERED is a direct delivery: the intake was handed straight to a
// department/employee/authorized/third party (never a warehouse), so there is
// no confirmation step and it never reaches inventory — its receipt is the
// downloadable Nota de Entrega.
export type GeneralArticleIntakeStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'DELIVERED';

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

// Snapshot of the requisition line this intake's purchase traces back to —
// lets the frontend compare "solicitado" vs "comprado" without a second call.
export interface GeneralArticleIntakeRequisitionRef {
  id: number;
  quantity: number;
  unit?: GeneralArticleIntakeUnitRef | null;
}

// Quote-article line the intake's purchase order line was created from.
// Present only when the purchase order line traces back to a requisition
// (i.e. not for ad-hoc/direct purchases). `justification` is the reason the
// buyer gave at quote time for changing quantity/unit vs. what was requested.
export interface GeneralArticleIntakeQuoteOrderRef {
  id: number;
  quantity: number;
  unit?: GeneralArticleIntakeUnitRef | null;
  justification?: string | null;
  general_article_requisition_order?: GeneralArticleIntakeRequisitionRef | null;
}

export interface GeneralArticleIntakeWarehouseRef {
  id: number;
  location_id: number;
  name: string;
  type: string;
}

// Direct-delivery destinations — the same entities a general-article
// requisition line can be affiliated to, so the whole thread
// (requisition → purchase → delivery) stays linked. Mutually exclusive with
// each other and with `warehouse`.
export interface GeneralArticleIntakeDepartmentRef {
  id: number;
  name: string;
}

export interface GeneralArticleIntakeThirdPartyRef {
  id: number;
  name: string;
}

export interface GeneralArticleIntakeEmployeeRef {
  id: number;
  first_name: string;
  last_name: string;
  dni: string;
}

export interface GeneralArticleIntakeAuthorizedEmployeeRef {
  id: number;
  full_name: string;
  dni: string;
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
  rejected_by?: string | null;
  rejected_at?: string | null;
  rejection_reason?: string | null;
  observation?: string | null;
  unit?: GeneralArticleIntakeUnitRef | null;
  warehouse?: GeneralArticleIntakeWarehouseRef | null;
  department?: GeneralArticleIntakeDepartmentRef | null;
  third_party?: GeneralArticleIntakeThirdPartyRef | null;
  employee?: GeneralArticleIntakeEmployeeRef | null;
  authorized_employee?: GeneralArticleIntakeAuthorizedEmployeeRef | null;
  purchase_order?: GeneralArticleIntakePurchaseOrderRef | null;
  general_article_quote_order?: GeneralArticleIntakeQuoteOrderRef | null;
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

// PATCH /{company}/general-article-intakes/{id}/reject
export interface RejectGeneralArticleIntakeResponse {
  message: string;
  intake: GeneralArticleIntake;
}
