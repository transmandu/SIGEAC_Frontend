import type { EditReason } from "@/lib/planificacion/editReasons";

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "RETIRE"
  | "RESTORE"
  | "EMIT"
  | "IMPORT"
  | "PURGE";

export type AuditEventKind = "CORRECTION" | "WORKFLOW";

/** Espejo de AuditRegistry::MODULES del backend. */
export type AuditModule =
  | "flights"
  | "work_orders"
  | "maintenance_controls"
  | "component_controls"
  | "avionics_controls"
  | "directive_controls"
  | "fleet"
  | "audit";

/** Raíces cuyo historial se puede pedir; `aircraft` trae todo lo de esa aeronave. */
export type AuditSubjectType =
  | "flight"
  | "work_order"
  | "maintenance_control"
  | "component_control"
  | "avionics_control"
  | "directive_control"
  | "aircraft"
  | "aircraft_part"
  | "maintenance_provider"
  | "planification_audit";

export interface PlanificationAuditField {
  field: string;
  old_value: string | null;
  new_value: string | null;
  field_kind: AuditEventKind;
  is_critical: boolean;
}

/** Un registro tocado dentro de una operación. */
export interface PlanificationAuditEntry {
  id: number;
  sequence: number | null;
  hash: string | null;
  operation_id: string;
  action: AuditAction;
  auditable_type: string;
  auditable_id: number;
  subject_type: AuditSubjectType | null;
  subject_id: number | null;
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
  ip_address: string | null;
  user_agent: string | null;
  fields: PlanificationAuditField[];
}

/** Un guardado: todo lo que cambió en una misma petición. */
export interface PlanificationAuditOperation {
  operation_id: string;
  changed_at: string;
  changed_by: string;
  ip_address: string | null;
  user_agent: string | null;
  event_kind: AuditEventKind;
  reason_category: EditReason | null;
  reason_note: string | null;
  has_critical: boolean;
  actions: AuditAction[];
  entries: PlanificationAuditEntry[];
}

export interface PlanificationAuditFilters {
  from?: string;
  to?: string;
  module?: AuditModule;
  subject_type?: AuditSubjectType;
  subject_id?: number;
  action?: AuditAction[];
  event_kind?: AuditEventKind;
  reason_category?: EditReason | "SIN_CLASIFICAR";
  critical_only?: boolean;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface PaginatedAuditOperations {
  data: PlanificationAuditOperation[];
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
  period: { from: string | null; to: string };
  totals: {
    entries: number;
    operations: number;
    corrections: number;
    workflow: number;
    errors: number;
    critical_corrections: number;
    unclassified: number;
  };
  by_action: Partial<Record<AuditAction, number>>;
  by_module: { module: AuditModule; operations: number; corrections: number }[];
  error_rate: Partial<Record<AuditModule, ErrorRate>>;
  by_reason: { reason: EditReason | "SIN_CLASIFICAR"; count: number }[];
  by_field: {
    type: string;
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

export interface AuditIntegrity {
  ok: boolean;
  checked: number;
  unsealed: number;
  head_sequence: number;
  broken_at: number | null;
  reason: string | null;
  verified_at: string;
}
