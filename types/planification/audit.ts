import type { EditReason } from "@/lib/planificacion/editReasons";

export type AuditableType =
  "flight" | "work_order" | "work_order_task" | "planification_event";

export type AuditEventKind = "CORRECTION" | "WORKFLOW";

// Filtro de la vista: "work_order" incluye sus tareas (lo resuelve el backend).
export type AuditTypeFilter = "flight" | "work_order";

export interface PlanificationAuditField {
  field: string;
  old_value: string | null;
  new_value: string | null;
  field_kind: AuditEventKind;
  is_critical: boolean;
}

export interface PlanificationAuditLog {
  id: number;
  auditable_type: AuditableType;
  auditable_id: number;
  work_order_id: number | null;
  aircraft_id: number | null;
  reference: string | null;
  event_kind: AuditEventKind;
  reason_category: EditReason | null;
  reason_note: string | null;
  record_author: string | null;
  record_created_at: string | null;
  has_critical: boolean;
  changed_by: string;
  changed_at: string;
  fields: PlanificationAuditField[];
}

export interface PlanificationAuditFilters {
  from?: string;
  to?: string;
  type?: AuditTypeFilter;
  event_kind?: AuditEventKind;
  reason_category?: EditReason | "SIN_CLASIFICAR";
  critical_only?: boolean;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface PaginatedAuditLogs {
  data: PlanificationAuditLog[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ErrorRate {
  created: number;
  with_errors: number;
  rate: number | null;
}

export interface PlanificationAuditStats {
  period: { from: string; to: string };
  totals: {
    edits: number;
    corrections: number;
    workflow: number;
    errors: number;
    critical_corrections: number;
    unclassified: number;
  };
  error_rate: { flights?: ErrorRate; work_orders?: ErrorRate };
  by_reason: { reason: EditReason | "SIN_CLASIFICAR"; count: number }[];
  by_field: {
    type: AuditableType;
    field: string;
    critical: boolean;
    count: number;
    errors: number;
  }[];
  by_author: { author: string; corrections: number; errors: number }[];
  by_editor: { editor: string; corrections: number; workflow: number }[];
  time_to_correction: {
    samples: number;
    avg_days: number | null;
    median_days: number | null;
  };
  monthly: {
    month: string;
    corrections: number;
    errors: number;
    workflow: number;
  }[];
}
