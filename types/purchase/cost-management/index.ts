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

/** Conversión unidad-a-unidad de un artículo general (ej: 1 CAJA = 20 UNID). */
export interface GeneralArticleConversion {
  primary_unit: number;
  secondary_unit: number;
  equivalence: number;
}

export interface GeneralCostRow {
  id: number;
  description?: string;
  brand_model?: string;
  variant_type?: string;
  unit_label?: string;
  cost?: number;
  cost_history?: import('@/types').GeneralArticleCostHistoryEntry[];
  /** Unidad base del artículo: referencia para el equivalente por unidad. */
  primary_unit_id?: number;
  /** Conversiones registradas: reexpresan el costo crudo a la unidad base. */
  conversions?: GeneralArticleConversion[];
}

export type DraftValue = string | number | undefined;

export interface ArticleCostColumnsArgs {
  onCostChange: (id: number, value: string) => void;
  /** Muestra la columna de unidad (solo aplica a Consumibles). */
  showUnit?: boolean;
}

export interface GeneralCostColumnsArgs {
  onCostChange: (id: number, value: string) => void;
  onViewHistory?: (row: GeneralCostRow) => void;
}

export interface BuildColumnsArgs {
  type: CostType;
  onCostChange: (id: number, value: string) => void;
  onViewHistory?: (row: GeneralCostRow) => void;
  /** Categoría activa del tipo ARTICLE (para decidir columnas condicionales). */
  category?: string;
}