import type { Unit, Vendor } from '@/types';

// ── Article-level status on requisition articles ───────────────────────────
export type RequisitionArticleStatus = 'PENDING' | 'APPROVED' | 'PARTIAL' | 'REJECTED';

// ── Quote-level status ─────────────────────────────────────────────────────
export type QuoteStatus = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';

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
  batch?: { id: number; name: string } | null;
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
  vendor?: Vendor | null;
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
  unit?: Unit | null;
  general_article_requisition_order: GeneralArticleRequisitionOrderRef | null;
}

// ── Quote response (list & detail) ────────────────────────────────────────
export interface Quote {
  id: number;
  quote_number: string;
  status: QuoteStatus;
  justification?: string | null;
  observation?: string | null;
  quote_date: string;
  total: number | null;
  created_by: string;
  vendor: Vendor | null;
  requisition_order: {
    id: number;
    order_number: string;
    image?: string | null;
    requested_by: string;
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
  condition_id?: number | null;
  unit_id?: number | null;
  reference?: string | null;
  lead_time?: string | null;
  /** Explains a quantity discrepancy — written to the requisition article, not the quote article. */
  justification?: string | null;
}

export interface CreateQuoteGeneralArticleData {
  general_article_requisition_order_id: number;
  quantity: number;
  unit_price: number;
  unit_id?: number | null;
  brand_model?: string | null;
  reference?: string | null;
  lead_time?: string | null;
  /** Explains a quantity discrepancy — written to the requisition article, not the quote article. */
  justification?: string | null;
}

export interface CreateQuoteData {
  quote_date: string;
  location_id: number;
  requisition_order_id: number;
  vendor_id?: number | null;
  total?: number | null;
  justification?: string | null;
  observation?: string | null;
  articles?: CreateQuoteArticleData[];
  general_articles?: CreateQuoteGeneralArticleData[];
}

// ── Update quote status mutation payload ───────────────────────────────────
// Only PENDIENTE and RECHAZADA are allowed — APROBADA is set automatically
// by the backend when a Purchase Order is created from this quote.
export interface UpdateQuoteStatusData {
  status: 'PENDIENTE' | 'RECHAZADA';
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
}
