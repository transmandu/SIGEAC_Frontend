import type { ArticleDocumentRequirementSummary } from "@/types";

/** Estados del registro de cuarentena (quarantine_articles.status). */
export type QuarantineStatus = "OPEN" | "PENDING_REINSPECTION" | "RESOLVED";

/** Filtro de las vistas; UNRESOLVED agrupa lo que sigue vivo en el ciclo. */
export type QuarantineStatusFilter = QuarantineStatus | "ALL" | "UNRESOLVED";

export type QuarantineCycleOutcome = "APPROVED" | "REJECTED";

/**
 * Una ida y vuelta entre calidad y compras. El primero es el rechazo original;
 * los siguientes existen solo si el artículo se corrigió y volvió a fallar.
 */
export type QuarantineCycle = {
  id: number;
  quarantine_article_id: number;
  cycle_number: number;
  reason: string;
  reported_by: string | null;
  reported_at: string | null;
  resolution_notes: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  outcome: QuarantineCycleOutcome | null;
  outcome_notes: string | null;
  outcome_by: string | null;
  outcome_at: string | null;
};

export type QuarantineArticleRef = {
  id: number;
  part_number: string | null;
  serial: string | null;
  alternative_part_number: string[] | string | null;
  description: string | null;
  status: string | null;
  ata_code: string | null;
  batch?: {
    id: number;
    name: string | null;
    warehouse?: {
      id: number;
      name: string | null;
      location?: { id: number; address: string | null; cod_iata: string | null } | null;
    } | null;
  } | null;
  condition?: { id: number; name: string | null } | null;
  purchase_order?: { id: number; order_number: string | null } | null;
  document_requirements?: ArticleDocumentRequirementSummary[];
};

export type QuarantineRecord = {
  id: number;
  /** El driver de SQL Server devuelve los bigint como string. */
  article_id: number | string;
  reason: string;
  quarantine_entry_date: string | null;
  quarantine_exit_date: string | null;
  inspector: string | null;
  status: QuarantineStatus;
  disposition: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  resolution_notes: string | null;
  /** Calculados por el backend contra el plazo configurado de la empresa. */
  days_in_quarantine: number | null;
  days_remaining: number | null;
  is_overdue: boolean;
  article?: QuarantineArticleRef | null;
  cycles?: QuarantineCycle[];
};
