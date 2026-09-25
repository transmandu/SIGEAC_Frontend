import type { ToDeterminateQueueArticle } from "@/types/inventory/queues";

/**
 * Fila de la cola de destino indeterminado
 * (`articles/queues/to-determinate`). La descripción es el nombre del renglón
 * (`batch.name`) y el tipo, su categoría (`batch.category`).
 */
export type DestinationArticle = ToDeterminateQueueArticle;
