// ── Cost Management Types ────────────────────────────────────────────────

export type CostType = "ARTICLE" | "GENERAL";

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
  "all" | "aeronautical" | "general" | "AERONAUTICAL" | "GENERAL";

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

/** Fila de `GET purchase/costs/articles`. */
export interface ArticleCostRow {
  id: number;
  part_number: string | null;
  /** Serial, o el lote en un consumible: lo que muestra la celda. */
  serial: string | null;
  batch_name: string | null;
  category: string;
  condition: string | null;
  unit_label: string | null;
  cost: number;
  /** Clave del grupo cuando la vista agrupa. */
  group_key?: string;
}

/** Conversión unidad-a-unidad de un artículo general (ej: 1 CAJA = 20 UNID). */
export interface GeneralArticleConversion {
  unit_id: number;
  /** Cuántas unidades base equivalen a 1 unit_id. */
  base_per_unit: number;
}

/** Fila de `GET purchase/costs/general-articles`. */
export interface GeneralCostRow {
  id: number;
  description: string;
  brand_model: string | null;
  variant_type: string | null;
  general_primary_unit: {
    id?: number;
    label: string | null;
    value: string | null;
  } | null;
  /** Unidad base del artículo: referencia para el equivalente por unidad. */
  primary_unit_id: number | null;
  /** Costo vigente, crudo: en la unidad en que se registró. */
  cost: number;
  cost_unit_id: number | null;
  cost_unit_label: string | null;
  /** Conversiones registradas: reexpresan el costo crudo a la unidad base. */
  conversions: GeneralArticleConversion[];
  group_key?: string;
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
