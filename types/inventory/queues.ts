import type { ArticleDocumentRequirementSummary } from "@/types";

/**
 * Contratos de las colas de trabajo de artículos por estado. Son de una
 * sede: el backend exige que el usuario opere en ella. La descripción de un
 * artículo aeronáutico es el nombre de su renglón (`batch.name`).
 */
export interface QueueArticleBase {
  id: number;
  part_number: string;
  alternative_part_number: string[];
  serial: string | null;
  ata_code: string | null;
  status: string;
  batch: {
    id: number;
    name: string;
    category: string;
    warehouse: {
      id: number;
      name: string;
      location: {
        id: number;
        address: string | null;
        cod_iata: string | null;
      } | null;
    } | null;
  } | null;
}

/** Recepción del almacén y compras · en tránsito. */
export interface TransitQueueArticle extends QueueArticleBase {
  /** Entrada al estado actual (ISO). */
  status_since: string | null;
  reception_date: string | null;
  condition: { id: number; name: string } | null;
  manufacturer: { id: number; name: string } | null;
  quantity: number;
  unit: string;
  order_number: string | null;
  requisition_order_number: string | null;
  has_documentation: boolean;
  document_requirements: ArticleDocumentRequirementSummary[];
}

/** Compras · destino indeterminado. */
export interface ToDeterminateQueueArticle extends QueueArticleBase {
  manufacturer: { id: number; name: string } | null;
  quantity: number;
  unit: string;
}

/** Almacén · por ubicar. */
export interface WaitingToLocateQueueArticle extends QueueArticleBase {
  zone: string | null;
}

/** Control de calidad · incoming, pendientes por formato y re-inspección. */
export interface InspectionQueueArticle extends QueueArticleBase {
  zone: string | null;
  order_number: string | null;
  quantity: number;
  unit: string;
}

export type InspectionQueueStatus =
  "INCOMING" | "WAITING_FOR_FORMAT" | "PENDING_REINSPECTION";

/** Opciones de los filtros de artículo del reporte de despacho. */
export interface DispatchReportArticleOptions {
  part_numbers: string[];
  alternative_part_numbers: string[];
  descriptions: string[];
  variant_types: string[];
  brand_models: string[];
}
