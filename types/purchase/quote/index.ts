import type { Location, Retailer, Unit, Vendor } from '@/types';

// ── Article-level status on requisition articles ───────────────────────────
export type RequisitionArticleStatus = 'PENDING' | 'APPROVED' | 'PARTIAL' | 'REJECTED';

// ── Quote-level status ─────────────────────────────────────────────────────
/**
 * DRAFT es un borrador: todavía no es una cotización. No tiene correlativo, no
 * se compara, no notifica y no genera orden de compra; solo lo ve su creador.
 * Al emitirse pasa a PENDING y deja de ser borrador para siempre.
 */
export type QuoteStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';

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
  /**
   * Artículo de la requisición que esta línea cotiza. Llega como string en las
   * respuestas crudas (bigint de SQL Server) y es la identidad con la que se
   * emparejan las líneas: la posición en la lista no sirve, porque el
   * formulario las agrupa por lote y el backend las crea en orden de
   * requisición.
   */
  article_requisition_order_id?: number | string | null;
  /**
   * Justificación y número de parte alterno que solo se escriben al artículo de
   * la requisición al emitir: un borrador descartado no debe dejar rastro.
   */
  deferred_justification?: string | null;
  deferred_alt_part_number?: string | null;
  quantity: number;
  unit_price: string | number;
  total: string | number;
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
  /** Ver la nota de `article_requisition_order_id` en ArticleQuoteOrder. */
  general_article_requisition_order_id?: number | string | null;
  /** Se escribe al artículo de la requisición solo al emitir. */
  deferred_justification?: string | null;
  quantity: number;
  unit_price: string | number;
  total: string | number;
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
  /** null mientras es un borrador: el correlativo se asigna al emitir. */
  quote_number: string | null;
  status: QuoteStatus;
  observation?: string | null;
  quote_date: string;
  total: number | null;
  created_by: string;
  created_at?: string | null;
  updated_at?: string | null;
  /** Cuándo y quién emitió la cotización; null mientras es borrador. */
  issued_at?: string | null;
  issued_by?: string | null;
  vendor: Vendor | null;
  /** Quote-level comercio / lugar de compra — set for quotes from a general requisition, mirrors `vendor` for aeronautical ones. */
  retailer: Retailer | null;
  /**
   * Claves planas de la cabecera. Las devuelven las respuestas crudas (las de
   * borrador), y son lo que el formulario necesita para retomar la sede, el
   * proveedor/comercio y la fecha al reabrir un borrador.
   */
  location_id?: number | string | null;
  vendor_id?: number | string | null;
  retailer_id?: number | string | null;
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
  /**
   * Original quote this one complements (null for regular quotes). A
   * complementary quote documents the difference between what was actually
   * purchased and what the original (already APPROVED/paid) chain covered —
   * paid documents are never edited or deleted, the missing amount gets its
   * own quote → PO → payment → intake cycle.
   */
  parent_quote_order?: { id: number; quote_number: string } | null;
  /** Mandatory reason explaining why the undocumented difference exists. */
  complementary_justification?: string | null;
}

// ── Create quote mutation payload ──────────────────────────────────────────
export interface CreateQuoteArticleData {
  article_requisition_order_id: number;
  quantity: number;
  unit_price: number;
  total: number;
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
  total: number;
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

// ── Quote draft payloads ───────────────────────────────────────────────────
// Los precios llegan por partes (se pregunta artículo por artículo), así que
// una cotización de varios ítems rara vez se registra de una sentada. El
// borrador es donde se acumulan esas respuestas: no tiene correlativo, no se
// compara, no notifica y no genera orden de compra. Al emitirse pasa a PENDING
// y deja de ser borrador para siempre.

export interface OpenQuoteDraftData {
  requisition_order_id: number;
  quote_date?: string;
}

/**
 * Línea de borrador. A diferencia de CreateQuoteArticleData, acepta precio y
 * cantidad vacíos: guardar a medias es la razón de ser del borrador.
 */
export interface SaveQuoteDraftArticleData {
  id: number;
  is_not_quoted?: boolean;
  quantity?: number | null;
  unit_price?: number | null;
  total?: number | null;
  unit_id?: number | null;
  vendor_id?: number | null;
  location_id?: number | null;
  condition_id?: number | null;
  reference?: string | null;
  lead_time?: string | null;
  quote_justification?: string | null;
  justification?: string | null;
  alt_part_number?: string | null;
}

export interface SaveQuoteDraftGeneralArticleData {
  id: number;
  is_not_quoted?: boolean;
  quantity?: number | null;
  unit_price?: number | null;
  total?: number | null;
  unit_id?: number | null;
  retailer_id?: number | null;
  location_id?: number | null;
  brand_model?: string | null;
  reference?: string | null;
  lead_time?: string | null;
  quote_justification?: string | null;
  justification?: string | null;
}

export interface SaveQuoteDraftData {
  quote_date?: string;
  /**
   * Cabecera del documento. `location_id` y `requisition_order_id` no se
   * mandan: mover un borrador de sede o de requisición huerfanaría sus líneas,
   * y el backend los ignora.
   */
  vendor_id?: number | null;
  retailer_id?: number | null;
  observation?: string | null;
  articles?: SaveQuoteDraftArticleData[];
  general_articles?: SaveQuoteDraftGeneralArticleData[];
}

// ── Create complementary quote mutation payload ────────────────────────────
// POST /{company}/quote/{id}/complementary — only for APPROVED general quotes.
// Each item references an item of the ORIGINAL quote; descriptive/purchase
// data is inherited server-side, only the extra quantity and price are sent.
export interface CreateComplementaryQuoteItemData {
  general_article_quote_order_id: number;
  quantity: number;
  unit_price: number;
}

export interface CreateComplementaryQuoteData {
  quote_date: string;
  justification: string;
  general_articles: CreateComplementaryQuoteItemData[];
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
