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
