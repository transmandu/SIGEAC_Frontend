import type { TransitQueueArticle } from "@/types/inventory/queues";

export type TransitStatus = "ALL" | "TRANSIT" | "RECEPTION";

/**
 * Fila de la cola de tránsito (`articles/queues/transit`). La comparten la
 * recepción del almacén y compras · en tránsito, que pintan lo mismo.
 */
export type TransitArticle = TransitQueueArticle;

export type TransitStatusFilter = "ALL" | "INCOMING" | TransitStatus;

export interface TransitFilterState {
  status: TransitStatusFilter;
  search: string;
}

/** Una anotación vigente de la bitácora de tránsito de un artículo. */
export interface TransitUpdate {
  id: number;
  note: string;
  /** Cuándo ocurrió (instante ISO). */
  occurred_at: string;
  registered_by: string;
  registered_by_username: string;
  edited_at: string | null;
  edited_by: string | null;
  /** Quien consulta puede corregirla o borrarla y el artículo sigue en tránsito. */
  can_modify: boolean;
}

interface TransitUpdateSnapshot {
  note: string;
  occurred_at: string;
}

/** Corrección o borrado de una anotación, con lo que decía antes. */
export interface TransitUpdateLogEntry {
  id: number;
  update_id: number;
  action: "EDITED" | "DELETED";
  old_values: TransitUpdateSnapshot;
  new_values: TransitUpdateSnapshot | null;
  performed_by: string;
  performed_at: string;
}

export interface TransitUpdatesResponse {
  article: {
    id: number;
    part_number: string | null;
    status: string;
    /** Sigue en `TRANSIT`: fuera de ahí la bitácora solo se consulta. */
    can_write: boolean;
    purchase_order_number: string | null;
    shipping_tracking: string | null;
    international_shipping_tracking: string | null;
    /** Otros artículos de la misma orden que siguen en tránsito en la sede. */
    order_siblings_count: number;
  };
  data: TransitUpdate[];
  log: TransitUpdateLogEntry[];
}

export interface TransitUpdatePayload {
  note: string;
}
