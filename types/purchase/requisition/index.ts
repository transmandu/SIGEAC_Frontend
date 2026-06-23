import type { Unit, User, Aircraft, WorkOrder, Convertion, Department, ThirdParty } from '@/types';
import type { PurchaseOrder } from '@/types/purchase/purchase-order';
import type { Quote } from '@/types/purchase/quote';

// ── Purchase-specific enums ────────────────────────────────────────────────
export type PurchasePriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type PurchaseStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'PARTIAL'
  | 'REJECTED'
  | 'PROCESO'
  | 'COTIZADO'
  | 'APROBADA'
  | 'RECHAZADA';

export type RequisitionType = 'AERONAUTICAL' | 'GENERAL';

// ── Batch Article (response / detail) ──────────────────────────────────────
export interface BatchArticle {
  id?: number;
  article_part_number: string;
  article_alt_part_number?: string;
  justification?: string | null;
  quantity: number;
  approved_quantity?: number;
  status?: string;
  unit?: Unit | null;
  priority?: string;
  image?: string | null;
  aircraft?: string | { acronym: string } | null;
}

export interface RequisitionBatch {
  id: number;
  name: string;
  category?: string;
  batch_articles: BatchArticle[];
}

// ── General Article (response / detail) ────────────────────────────────────
export interface RequisitionGeneralArticle {
  id: number;
  description: string;
  variant_type?: string | null;
  quantity: string | number;
  approved_quantity?: string | number;
  unit?: Unit | null;
  priority?: string;
  status?: string;
  image?: string | null;
  justification?: string | null;
}

// ── Requisition Quote Reference ────────────────────────────────────────────
export interface RequisitionQuote {
  quote_number: string;
  status: string;
  vendor: {
    name: string | null;
  };
  article_vendors?: string[];
  updated_at: string;
}

// ── Requisition (list view) ────────────────────────────────────────────────
export interface Requisition {
  id: number;
  order_number: string;
  status: PurchaseStatus | string;
  created_by: User;
  requested_by: string;
  batch: {
    name: string;
    batch_articles: {
      article_part_number: string;
      quantity: number;
      unit?: Convertion;
      image: string;
      aircraft?: string;
    }[];
  }[];
  general_articles?: {
    id: number;
    description: string;
    variant_type?: string;
    quantity: number;
    unit?: Unit;
    image?: string;
  }[];
  received_by?: string;
  justification: string;
  arrival_date?: string;
  submission_date: string;
  work_order?: WorkOrder;
  aircraft?: Aircraft | null;
  department?: Department | null;
  third_party?: ThirdParty | null;
  quotes?: RequisitionQuote[];
  type: RequisitionType;
  priority?: PurchasePriority | string;
  observation?: string | null;
}

// ── General Sales Report ─────────────────────────────────────────────────
export type GeneralSalesReport = {
  requisition_order: Requisition;
  purchase_order?: PurchaseOrder;
  quote_order?: Quote[];
}[];

// ── Requisition Detail ─────────────────────────────────────────────────────
export interface RequisitionByOrderNumber {
  id: number;
  order_number: string;
  status: string;
  priority?: PurchasePriority | string;
  type: RequisitionType;
  created_by: User;
  requested_by: string;
  updated_by?: string | null;
  justification: string;
  image?: string | null;
  submission_date?: string | null;
  observation?: string | null;
  aircraft?: Aircraft | null;
  department?: Department | null;
  third_party?: ThirdParty | null;
  batch?: RequisitionBatch[] | null;
  general_articles?: RequisitionGeneralArticle[] | null;
  quotes?: RequisitionQuote[] | null;
}

// ── Create / Update Mutation Payloads ──────────────────────────────────────

/** Form payload for creating a batch article inside a requisition. */
export interface BatchArticlePayload {
  part_number?: string;
  alt_part_number?: string;
  quantity: number;
  unit?: string | number;
  aircraft_id?: string | number;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  justification?: string;
  image?: File;
}

/** Form payload for a batch inside a requisition. */
export interface BatchPayload {
  batch: string | number;
  batch_name: string;
  batch_articles: BatchArticlePayload[];
}

/** Form payload for a general article inside a requisition. */
export interface GeneralArticlePayload {
  description?: string;
  variant_type?: string;
  quantity: number;
  unit_id?: string | number;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  justification?: string;
  image?: File;
}

// ── Form State Types ──────────────────────────────────────────────────────
// These types mirror the strict shape inferred from the Zod schemas used in
// the requisition forms. They are intentionally stricter than the API payload
// types because they represent validated in-form state rather than the
// looser API contract.

/** Form state for a batch article inside a requisition form. */
export interface RequisitionBatchArticleForm {
  part_number: string;
  alt_part_number?: string;
  quantity: number;
  unit?: string;
  aircraft_id?: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  image?: File;
}

/** Form state for a batch inside a requisition form. */
export interface RequisitionBatchForm {
  batch: string;
  batch_name: string;
  batch_articles: RequisitionBatchArticleForm[];
}

/** Form state for a general article inside a requisition form. */
export interface RequisitionGeneralArticleForm {
  description: string;
  variant_type?: string;
  quantity: number;
  unit_id?: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  image?: File;
}

/** Mutation payload for creating / updating a requisition order. */
export interface CreateRequisitionData {
  justification?: string;
  observation?: string;
  requested_by: string;
  created_by: string | number;
  location_id: string | number;
  type: 'AERONAUTICAL' | 'GENERAL';
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  work_order_id?: string | number;
  aircraft_id?: string | number;
  department_id?: string | number;
  third_party_id?: string | number;
  image?: File;
  articles?: BatchPayload[];
  general_articles?: GeneralArticlePayload[];
}