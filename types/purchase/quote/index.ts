import type { Location, Retailer, Unit, Vendor } from '@/types';

// ── Article-level status on requisition articles ───────────────────────────
export type RequisitionArticleStatus = 'PENDING' | 'APPROVED' | 'PARTIAL' | 'REJECTED';

// ── Quote-level status ─────────────────────────────────────────────────────
export type QuoteStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// ── Nested requisition article snapshot inside a quote article ─────────────
export interface ArticleRequisitionOrderRef {
  id: number;
  article_part_number: string | null;
  article_alt_part_number?: string | null;
  quantity: number;
  approved_quantity?: number | null;
  status: RequisitionArticleStatus;
  justification?: string | null;
  priority?: string | null;
  batch?: { id: number; name: string; category?: string | null } | null;
  unit?: Unit | null;
}

export interface GeneralArticleRequisitionOrderRef {
  id: number;
  description: string;
  variant_type?: string | null;
  quantity: number;
  approved_quantity?: number | null;
  status: RequisitionArticleStatus;
  justification?: string | null;
  priority?: string | null;
  unit?: Unit | null;
}

// ── Quote article (standard — batch/aeronautical) ──────────────────────────
export interface ArticleQuoteOrder {
  id: number;
  quantity: number;
  unit_price: string | number;
  reference?: string | null;
  lead_time?: string | null;
  /** Reason for a quantity/unit change or exclusion made at quote time — stored on the quote article itself. */
  justification?: string | null;
  /** True when this row only exists to record that the article was deliberately not quoted. */
  is_not_quoted?: boolean;
  vendor?: Vendor | null;
  location?: Location | null;
  condition?: { id: number; name: string } | null;
  unit?: Unit | null;
  article_requisition_order: ArticleRequisitionOrderRef | null;
}

// ── Quote article (general) ────────────────────────────────────────────────
export interface GeneralArticleQuoteOrder {
  id: number;
  quantity: number;
  unit_price: string | number;
  brand_model?: string | null;
  reference?: string | null;
  lead_time?: string | null;
  /** Reason for a quantity/unit change or exclusion made at quote time — stored on the quote article itself. */
  justification?: string | null;
  /** True when this row only exists to record that the article was deliberately not quoted. */
  is_not_quoted?: boolean;
  /** Comercio / lugar de compra where this general article was quoted. */
  retailer?: Retailer | null;
  location?: Location | null;
  unit?: Unit | null;
  general_article_requisition_order: GeneralArticleRequisitionOrderRef | null;
}

// ── Quote response (list & detail) ────────────────────────────────────────
export interface Quote {
  id: number;
  quote_number: string;
  status: QuoteStatus;
  observation?: string | null;
  quote_date: string;
  total: number | null;
  created_by: string;
  vendor: Vendor | null;
  /** Quote-level comercio / lugar de compra — set for quotes from a general requisition, mirrors `vendor` for aeronautical ones. */
  retailer: Retailer | null;
  requisition_order: {
    id: number;
    order_number: string;
    image?: string | null;
    requested_by: string;
    status?: string | null;
    justification?: string | null;
    submission_date?: string | null;
    type?: string | null;
    priority?: string | null;
    work_order?: { id: number; order_number: string } | null;
  };
  article_quote_order: ArticleQuoteOrder[];
  general_article_quote_order: GeneralArticleQuoteOrder[];
}

// ── Create quote mutation payload ──────────────────────────────────────────
export interface CreateQuoteArticleData {
  article_requisition_order_id: number;
  quantity: number;
  unit_price: number;
  vendor_id?: number | null;
  location_id?: number | null;
  condition_id?: number | null;
  unit_id?: number | null;
  reference?: string | null;
  lead_time?: string | null;
  alt_part_number?: string | null;
  /** Explains a quantity discrepancy — written to the requisition article, not the quote article. */
  justification?: string | null;
  /** Reason for a quantity/unit change or exclusion made at quote time — stored on the quote article itself. */
  quote_justification?: string | null;
  /** True when the article is deliberately not being quoted — the row is kept only to carry the exclusion justification. */
  is_not_quoted?: boolean;
}

export interface CreateQuoteGeneralArticleData {
  general_article_requisition_order_id: number;
  quantity: number;
  unit_price: number;
  /** Comercio / lugar de compra selected for this general article. */
  retailer_id?: number | null;
  location_id?: number | null;
  unit_id?: number | null;
  brand_model?: string | null;
  reference?: string | null;
  lead_time?: string | null;
  /** Explains a quantity discrepancy — written to the requisition article, not the quote article. */
  justification?: string | null;
  /** Reason for a quantity/unit change or exclusion made at quote time — stored on the quote article itself. */
  quote_justification?: string | null;
  /** True when the article is deliberately not being quoted — the row is kept only to carry the exclusion justification. */
  is_not_quoted?: boolean;
}

export interface CreateQuoteData {
  quote_date: string;
  location_id: number;
  requisition_order_id: number;
  vendor_id?: number | null;
  retailer_id?: number | null;
  total?: number | null;
  observation?: string | null;
  articles?: CreateQuoteArticleData[];
  general_articles?: CreateQuoteGeneralArticleData[];
}

// ── Update quote status mutation payload ───────────────────────────────────
// Only PENDING and REJECTED are allowed — APPROVED is set automatically
// by the backend when a Purchase Order is created from this quote.
export interface UpdateQuoteStatusData {
  status: 'PENDING' | 'REJECTED';
  observation?: string | null;
}

// ── Quoteable requisition (used when selecting a requisition to quote) ─────
export interface QuoteableRequisition {
  id: number;
  order_number: string;
  requested_by: string;
  justification: string;
  batch: {
    batch_articles: {
      id?: number;
      article_part_number: string;
      article_alt_part_number?: string;
      quantity: number;
      unit?: { id: number } | null;
    }[];
    name: string;
    category?: string;
  }[];
  general_articles?: {
    id?: number;
    description: string;
    variant_type?: string | null;
    quantity: number;
    unit?: { id: number } | null;
  }[];
}
