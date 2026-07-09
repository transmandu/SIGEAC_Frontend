// ── Cost Management Types ────────────────────────────────────────────────

export type CostType = 'ARTICLE' | 'GENERAL';

/** Payload for updating a single cost. */
export interface UpdateCostPayload {
  company: string;
  id: number;
  cost: number;
}

/** Single item inside a bulk update request. */
export interface BulkUpdateItem {
  id: number;
  cost: number;
}

/** Payload for bulk updating costs. */
export interface BulkUpdatePayload {
  company: string;
  updates: BulkUpdateItem[];
}

export type Category =
  | 'all'
  | 'aeronautical'
  | 'general'
  | 'AERONAUTICAL'
  | 'GENERAL';

export interface BaseRow {
  id: number;
  batch_name?: string;
  part_number?: string;
  serial?: string;
  unit_label?: string;
  cost?: number;
  condition_name?: string;
  description?: string;
  brand_model?: string;
  variant_type?: string;
}

export interface ArticleCostRow {
  id: number;
  batch_name?: string;
  part_number?: string;
  serial?: string;
  unit_label?: string;
  cost?: number;
  condition_name?: string;
}

export interface GeneralCostRow {
  id: number;
  description?: string;
  brand_model?: string;
  variant_type?: string;
  unit_label?: string;
  cost?: number;
  cost_history?: import('@/types').GeneralArticleCostHistoryEntry[];
}

export type DraftValue = string | number | undefined;

export interface ArticleCostColumnsArgs {
  onCostChange: (id: number, value: string) => void;
}

export interface GeneralCostColumnsArgs {
  onCostChange: (id: number, value: string) => void;
  onViewHistory?: (row: GeneralCostRow) => void;
}

export interface BuildColumnsArgs {
  type: CostType;
  onCostChange: (id: number, value: string) => void;
  onViewHistory?: (row: GeneralCostRow) => void;
}