import type { InspectionQueueArticle } from "@/types/inventory/queues";
import { LucideIcon } from "lucide-react";

export type ChecklistValue = boolean | "NA";

export type ChecklistDecision = "ACCEPTED" | "HOLD" | "REJECTED";

export type ChecklistItem = {
  id: string;
  key: string;
  label: string;
  hint?: string;
  /** No admite N/A (los de documentación solo si el artículo los declara). */
  requiredForAccept?: boolean;
  /** Un NO aquí rechaza el artículo en el servidor: pasa a cuarentena. */
  critical?: boolean;
};

export type ChecklistGroup = {
  title: string;
  icon: LucideIcon;
  items: ChecklistItem[];
};

export type IncomingConfirmPayload = {
  decision: ChecklistDecision;
  checklist: Record<string, ChecklistValue>;
  notes?: string;
  final_zone?: string;
};

/** Estados en que Control de Calidad puede inspeccionar; el servidor aplica la misma regla. */
export const INSPECTABLE_STATUSES = ["INCOMING", "PENDING_REINSPECTION"];

/**
 * Fila de la cola de calidad (`articles/queues/inspection`): INCOMING,
 * WAITING_FOR_FORMAT o PENDING_REINSPECTION, la misma vista sirve a las tres.
 * `zone` es la propuesta desde recepción; almacén la confirma al ubicar.
 */
export type IncomingArticle = InspectionQueueArticle;
