import type { ArticleDimension, GeneralArticleUnit } from "@/types";

/**
 * Contratos de los listados de inventario. Cada pantalla tiene el suyo y
 * recibe solo lo que pinta: ninguno de inventario lleva costo, que vive en
 * los de gestión de costos.
 */

/** Envoltorio común de los listados paginados por cursor. */
export interface CursorPage<T> {
  data: T[];
  next_cursor: string | null;
  has_more: boolean;
  /**
   * Total bajo los filtros vigentes. Cuando la vista agrupa, cuenta grupos:
   * la página también avanza por grupos completos.
   */
  total?: number;
  /** Agrupación que aplicó el servidor; las filas de un grupo llegan juntas. */
  grouped_by?: string | null;
}

export interface InventoryUnit {
  id?: number;
  label: string | null;
  value: string | null;
}

/** Fila del inventario del almacén (aeronáutico). */
export interface WarehouseInventoryArticle {
  id: number;
  part_number: string;
  alternative_part_number: string[];
  serial: string | null;
  lot_number: string | null;
  batch_id: number;
  /** La descripción de un artículo aeronáutico es el nombre de su renglón. */
  batch_name: string | null;
  category: string;
  is_hazardous: boolean;
  zone: string | null;
  status: string;
  /** Entrada al estado actual (ISO). Null si no hay movimiento que lo feche. */
  status_since: string | null;
  condition: string | null;
  image: string | null;
  has_documentation: boolean;
  quantity: number;
  unit: InventoryUnit | null;
  /** Unidades almacenadas del número de parte en la sede (componentes y partes). */
  stock: number | null;
  expiration_date: string | null;
  shelf_life: string | null;
  dimension: ArticleDimension | null;
  aircraft: { id: number; acronym: string } | null;
  tool: {
    status: string | null;
    needs_calibration: boolean;
    calibration_date: string | null;
    next_calibration: number | string | null;
    model: string | null;
  } | null;
  /** Clave del grupo cuando la vista agrupa. */
  group_key: string | null;
}

/** Fila del inventario de consulta de la compañía (aeronáutico). */
export interface CompanyInventoryArticle {
  id: number;
  part_number: string;
  alternative_part_number: string[];
  serial: string | null;
  lot_number: string | null;
  /** Unidades que resume la fila: más de una cuando se agrupa por número de parte. */
  serial_count: number;
  description: string | null;
  category: string;
  is_hazardous: boolean;
  condition: string | null;
  /** Existencia almacenada: cero significa "No disponible". */
  available_quantity: number;
  unit: InventoryUnit | null;
  tool: {
    status: string | null;
    calibration_date: string | null;
    next_calibration: number | string | null;
  } | null;
}

/** Fila de la cola de revisión de ingeniería. */
export interface CheckingArticle {
  id: number;
  part_number: string;
  alternative_part_number: string[];
  serial: string | null;
  lot_number: string | null;
  batch_id: number;
  batch_name: string | null;
  category: string;
  is_hazardous: boolean;
  zone: string | null;
  status: string;
  condition: string | null;
  quantity: number;
  unit: InventoryUnit | null;
  min_quantity: number | null;
  tool: {
    status: string | null;
    calibration_date: string | null;
    next_calibration: number | string | null;
  } | null;
}

/** Renglón del ajuste de cantidades y ubicaciones, con sus artículos. */
export interface StockAdjustmentBatch {
  batch_id: number;
  name: string;
  category: string;
  medition_unit: string | null;
  articles: {
    id: number;
    part_number: string;
    alternative_part_number: string[];
    serial: string | null;
    lot_number: string | null;
    zone: string | null;
    status: string;
    quantity: number;
    unit: InventoryUnit | null;
  }[];
}

/** Fila del inventario de generales del almacén. */
export interface WarehouseInventoryGeneralArticle {
  id: number;
  description: string;
  brand_model: string | null;
  variant_type: string | null;
  quantity: number;
  minimum_quantity: number | null;
  maximum_quantity: number | null;
  primary_unit_id: number | null;
  general_primary_unit: GeneralArticleUnit;
  warehouse_id: number;
  image: string | null;
  dimension: ArticleDimension | null;
}

/** Fila del inventario de consulta de generales. */
export interface CompanyInventoryGeneralArticle {
  id: number;
  description: string;
  brand_model: string | null;
  variant_type: string | null;
  /** Existencia: cero significa "No disponible". */
  available_quantity: number;
  unit: InventoryUnit | null;
}

/** Artículo general del catálogo ligero de los formularios. */
export interface GeneralArticleCatalogItem {
  id: number;
  description: string;
  brand_model: string | null;
  variant_type: string | null;
  quantity: number;
  minimum_quantity: number | null;
  maximum_quantity: number | null;
  primary_unit_id: number | null;
  general_primary_unit: GeneralArticleUnit;
  warehouse_id: number;
  image: string | null;
}

/** Catálogo de compras: el ligero más el último costo registrado. */
export interface GeneralArticlePurchaseCatalogItem extends GeneralArticleCatalogItem {
  cost: number | null;
}
