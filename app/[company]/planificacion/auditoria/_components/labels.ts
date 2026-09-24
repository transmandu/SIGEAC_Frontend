import type { AuditableType } from "@/types/planification/audit";
import {
  CalendarDays,
  ListChecks,
  LucideIcon,
  Plane,
  Wrench,
} from "lucide-react";

export const TYPE_ICONS: Record<AuditableType, LucideIcon> = {
  flight: Plane,
  work_order: Wrench,
  work_order_task: ListChecks,
  planification_event: CalendarDays,
};

export const TYPE_LABELS: Record<AuditableType, string> = {
  flight: "Vuelo",
  work_order: "Orden de trabajo",
  work_order_task: "Tarea de OT",
  planification_event: "Evento de calendario",
};

const FIELD_LABELS: Record<string, string> = {
  flight_number: "N° de vuelo",
  aircraft_operator: "Piloto",
  origin: "Salida",
  destination: "Destino",
  flight_hours: "Horas de vuelo",
  flight_cycles: "Ciclos de vuelo",
  flight_date: "Fecha de vuelo",
  aircraft_id: "Aeronave",
  order_number: "N° de orden",
  description: "Descripción",
  elaborated_by: "Elaborado por",
  reviewed_by: "Revisado por",
  approved_by: "Aprobado por",
  date: "Fecha de orden",
  department_responsible: "Departamento",
  status: "Estado",
  document: "Documento",
  planification_event_id: "Evento de planificación",
  description_task: "Descripción de tarea",
  ata: "ATA",
  material: "Material",
  task_number: "N° de tarea",
  origin_manual: "Manual de origen",
  technician_responsable: "Técnico",
  inspector_responsable: "Inspector",
  old_technician: "Técnicos anteriores",
  title: "Título",
  start_date: "Inicio",
  end_date: "Fin",
  priority: "Prioridad",
};

export const fieldLabel = (field: string) => FIELD_LABELS[field] ?? field;
