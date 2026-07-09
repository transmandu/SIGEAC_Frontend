import type { Unit, User, Aircraft, WorkOrder, Convertion, Department, ThirdParty, Employee } from '@/types';
import type { PurchaseOrder } from '@/types/purchase/purchase-order';
import type { Quote } from '@/types/purchase/quote';

// ── General Article relation summaries (response) ──────────────────────────
// Narrowed projections returned by the backend for general article requisitions.
export type GeneralArticleDepartment = Pick<Department, 'id' | 'name' | 'acronym'>;
export type GeneralArticleThirdParty = Pick<ThirdParty, 'id' | 'name'>;
export type GeneralArticleEmployee = Pick<
  Employee,
  'id' | 'first_name' | 'last_name' | 'middle_name' | 'second_last_name' | 'dni'
>;
export interface GeneralArticleAuthorizedEmployee {
  id: number;
  dni_employee: string;
  full_name?: string;
}

// ── Purchase-specific enums ────────────────────────────────────────────────
export type PurchasePriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type PurchaseStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'PARTIAL'
  | 'REJECTED'
  | 'CREATED'
  | 'RECEIVED'
  | 'IN_PROGRESS'
  | 'QUOTED';

export type RequisitionType = 'AERONAUTICAL' | 'GENERAL';

// ── Batch Article (response / detail) ──────────────────────────────────────
export interface BatchArticleDocumentType {
  id: number;
  name: string;
  description?: string | null;
  regulation?: string | null;
}

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
  document_types?: BatchArticleDocumentType[];
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
  requested_date?: string | null;
  variant_type?: string | null;
  quantity: string | number;
  approved_quantity?: string | number;
  unit?: Unit | null;
  priority?: string;
  status?: string;
  image?: string | null;
  justification?: string | null;
  department?: GeneralArticleDepartment | null;
  third_party?: GeneralArticleThirdParty | null;
  employee?: GeneralArticleEmployee | null;
  authorized_employee?: GeneralArticleAuthorizedEmployee | null;
}

// ── Requisition Quote Reference ────────────────────────────────────────────
export interface RequisitionQuote {
  quote_number: string;
  status: string;
  vendor: {
    name: string | null;
  };
  retailer?: {
    name: string | null;
  };
  article_vendors?: string[];
  article_retailers?: string[];
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
      id?: number;
      article_part_number: string;
      quantity: number;
      unit?: Convertion;
      image: string;
      aircraft?: string;
      priority?: PurchasePriority | string;
    }[];
  }[];
  general_articles?: {
    id: number;
    description: string;
    requested_date?: string | null;
    variant_type?: string;
    quantity: number;
    unit?: Unit;
    image?: string;
    priority?: PurchasePriority | string;
    department?: GeneralArticleDepartment | null;
    third_party?: GeneralArticleThirdParty | null;
    employee?: GeneralArticleEmployee | null;
    authorized_employee?: GeneralArticleAuthorizedEmployee | null;
  }[];
  received_by?: string | null;
  received_at?: string | null;
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
  received_by?: string | null;
  received_at?: string | null;
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
  requested_date?: string;
  variant_type?: string | null;
  /** Disambiguates catalog entries that share description + variant_type but differ by brand. Not persisted by the backend. */
  brand_model?: string | null;
  quantity: number;
  unit_id?: string | number;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  justification?: string;
  image?: File;
  /** Storage path of the catalog article's existing image, sent instead of `image` to reuse it without re-uploading. */
  existing_image_path?: string;
  department_id?: string | number | null;
  third_party_id?: string | number | null;
  employee_id?: string | number | null;
  authorized_employee_id?: string | number | null;
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
  /** Tipos de documento (ArticleDocumentType) que deben solicitarse al vendedor para este ítem. Requiere al menos uno. */
  document_type_ids: number[];
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
  requested_date?: string;
  variant_type?: string | null;
  /** Disambiguates catalog entries that share description + variant_type but differ by brand. Not persisted by the backend. */
  brand_model?: string | null;
  quantity: number;
  unit_id?: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  image?: File | string;
  /** Storage path of the catalog article's existing image, sent instead of `image` to reuse it without re-uploading. */
  existing_image_path?: string;
  department_id?: string;
  third_party_id?: string;
  employee_id?: string;
  authorized_employee_id?: string;
}

/** Mutation payload for creating / updating a requisition order. */
export interface CreateRequisitionData {
  justification?: string;
  observation?: string;
  /** Either requested_by (DNI) or requested_by_authorized_employee_id must be present. */
  requested_by?: string;
  requested_by_authorized_employee_id?: number;
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