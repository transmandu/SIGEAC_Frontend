import { formatInstant } from "@/lib/date";
import type {
  AuditAction,
  AuditModule,
  AuditSubjectType,
} from "@/types/planification/audit";
import {
  ArchiveRestore,
  Archive,
  Boxes,
  ClipboardCheck,
  Cpu,
  Download,
  FilePlus2,
  FileWarning,
  LucideIcon,
  PencilLine,
  Plane,
  ScrollText,
  ShieldCheck,
  Trash2,
  Upload,
  Wrench,
} from "lucide-react";

export const ACTION_META: Record<
  AuditAction,
  { label: string; icon: LucideIcon }
> = {
  CREATE: { label: "Alta", icon: FilePlus2 },
  UPDATE: { label: "Edición", icon: PencilLine },
  DELETE: { label: "Eliminación", icon: Trash2 },
  RETIRE: { label: "Baja", icon: Archive },
  RESTORE: { label: "Reactivación", icon: ArchiveRestore },
  EMIT: { label: "Emisión", icon: Download },
  IMPORT: { label: "Importación", icon: Upload },
  PURGE: { label: "Purga", icon: FileWarning },
};

export const MODULE_META: Record<
  AuditModule,
  { label: string; icon: LucideIcon }
> = {
  flights: { label: "Vuelos", icon: Plane },
  work_orders: { label: "Órdenes de trabajo", icon: Wrench },
  maintenance_controls: {
    label: "Control de mantenimiento",
    icon: ClipboardCheck,
  },
  component_controls: { label: "Control de componentes", icon: Boxes },
  avionics_controls: { label: "Control de aviónica", icon: Cpu },
  directive_controls: { label: "Control de directivas", icon: ScrollText },
  fleet: { label: "Flota", icon: Plane },
  audit: { label: "Auditoría", icon: ShieldCheck },
};

const SUBJECT_MODULE: Record<AuditSubjectType, AuditModule> = {
  flight: "flights",
  work_order: "work_orders",
  maintenance_control: "maintenance_controls",
  component_control: "component_controls",
  avionics_control: "avionics_controls",
  directive_control: "directive_controls",
  aircraft: "fleet",
  aircraft_part: "fleet",
  maintenance_provider: "fleet",
  planification_audit: "audit",
};

export const SUBJECT_ICONS = Object.fromEntries(
  Object.entries(SUBJECT_MODULE).map(([subject, module]) => [
    subject,
    MODULE_META[module].icon,
  ]),
) as Record<AuditSubjectType, LucideIcon>;

const TYPE_LABELS: Record<string, string> = {
  flight: "Vuelo",
  work_order: "Orden de trabajo",
  work_order_task: "Tarea de OT",
  work_order_task_item: "Material de tarea",
  work_order_task_event: "Evento de tarea",
  non_routine: "No rutinaria",
  no_routine_task: "Tarea no rutinaria",
  preliminary_inspection: "Inspección preliminar",
  preliminary_inspection_item: "Hallazgo de inspección",
  work_order_report_page: "Hoja de reporte",
  work_order_report_page_item: "Reporte de hoja",
  maintenance_control: "Control de mantenimiento",
  maintenance_control_part: "Parte del control",
  maintenance_control_item: "Servicio/certificado",
  maintenance_control_item_interval: "Intervalo",
  maintenance_compliance: "Cumplimiento",
  component_control: "Control de componentes",
  component_control_item: "Componente",
  component_control_item_interval: "Intervalo",
  component_compliance: "Cumplimiento",
  avionics_control: "Control de aviónica",
  avionics_control_item: "Equipo de aviónica",
  avionics_control_task: "Tarea de aviónica",
  avionics_control_task_interval: "Intervalo",
  avionics_compliance: "Cumplimiento",
  directive_control: "Control de directivas",
  directive_control_item: "Directiva (AD)",
  directive_control_item_interval: "Intervalo",
  directive_compliance: "Cumplimiento",
  aircraft: "Aeronave",
  aircraft_part: "Parte de aeronave",
  aircraft_assignment: "Instalación de parte",
  maintenance_provider: "Proveedor de mantenimiento",
  planification_audit: "Auditoría",
};

export const typeLabel = (type: string) => TYPE_LABELS[type] ?? type;

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
  date: "Fecha",
  department_responsible: "Departamento",
  location_id: "Ubicación",
  status: "Estado",
  document: "Documento",
  planification_event_id: "Evento de planificación",
  description_task: "Descripción de tarea",
  ata: "ATA",
  ata_code: "ATA",
  material: "Material",
  task_number: "N° de tarea",
  origin_manual: "Manual de origen",
  task_items: "Materiales",
  technician_responsable: "Técnico",
  inspector_responsable: "Inspector",
  old_technician: "Técnicos anteriores",
  title: "Título",
  name: "Nombre",
  category: "Categoría",
  remaining_percentage: "% remanente de alerta",
  has_reference_manual: "Tiene manual de referencia",
  reference_manual: "Manual de referencia",
  maintenance_catalog_manual_id: "Manual del catálogo",
  maintenance_catalog_service_id: "Servicio del catálogo",
  first_applied_date: "Primera aplicación",
  maintenance_provider_id: "Realizado por",
  pending_work_order_id: "OT pendiente",
  work_order_id: "Orden de trabajo",
  counting_method: "Unidad",
  limit_kind: "Tipo de límite",
  limit_value: "Límite",
  initial_value: "Lectura inicial",
  consumed_at_event: "Consumido al instalar",
  compliance_date: "Fecha de cumplimiento",
  hours_reading: "Lectura de horas",
  cycles_reading: "Lectura de ciclos",
  consumed_hours: "Horas consumidas",
  consumed_cycles: "Ciclos consumidos",
  action: "Acción",
  notes: "Observaciones",
  is_historical: "Histórico",
  manual_revision_label: "Revisión del manual",
  part_number: "N° de parte",
  serial: "Serial",
  position: "Posición",
  is_hazardous: "Peligroso",
  is_on_condition: "Por condición",
  reference_document: "Documento de referencia",
  ad_number: "N° de AD",
  authority: "Autoridad",
  revision: "Revisión",
  compliance_method: "Método de cumplimiento",
  applicability: "Aplicabilidad",
  applicability_notes: "Notas de aplicabilidad",
  compliance_type: "Tipo de cumplimiento",
  observations: "Observaciones",
  time_since_new: "TSN",
  time_since_overhaul: "TSO",
  cycles_since_new: "CSN",
  cycles_since_overhaul: "CSO",
  condition_type: "Condición",
  type: "Tipo",
  manufacturer_id: "Fabricante",
  assigned_date: "Fecha de instalación",
  removed_date: "Fecha de remoción",
  part_order: "Orden",
  ata_chapter: "Capítulo ATA",
  acronym: "Matrícula",
  model: "Modelo",
  retired_at: "Dado de baja",
  document_type: "Documento",
  aircraft_hours_mode: "Horas impresas",
  aircraft_hours: "Horas impresas (manual)",
  as_of: "A la fecha",
  file: "Archivo",
  imported: "Importados",
  skipped: "Omitidos",
  period: "Período",
  filters: "Filtros",
  flights: "Vuelos",
  flight_history: "Historial de vuelo",
  aircraft_parts: "Partes",
  aircraft_assignments: "Instalaciones",
};

export const fieldLabel = (field: string) =>
  FIELD_LABELS[field] ?? field.replaceAll("_", " ");

const YES_NO = { "1": "Sí", "0": "No" };

const VALUE_LABELS: Record<string, Record<string, string>> = {
  counting_method: { HOURS: "Horas", CYCLES: "Ciclos", DAYS: "Días" },
  limit_kind: { HARD_TIME: "Hard time", LIFE_LIMIT: "Vida límite" },
  category: {
    CERTIFICATE: "Certificado",
    SERVICE: "Servicio",
    LANDING_GEAR: "Tren de aterrizaje",
    ENGINE_ACCESSORY: "Accesorio de motor",
    ENGINE_LLP: "LLP de motor",
    PROPELLER: "Hélice",
    AVIONICS: "Aviónica",
    EMERGENCY_EQUIPMENT: "Equipo de emergencia",
    HYDRAULIC_PNEUMATIC: "Hidráulico/neumático",
    FUEL_SYSTEM: "Sistema de combustible",
    ELECTRICAL: "Eléctrico",
    STRUCTURE: "Estructura",
    FLIGHT_INSTRUMENTS: "Instrumentos de vuelo",
    NAVIGATION: "Navegación",
    COMMUNICATION: "Comunicación",
    SURVEILLANCE: "Vigilancia",
    RECORDERS: "Registradores",
    EMERGENCY: "Emergencia",
    AUTOPILOT: "Piloto automático",
    RADAR: "Radar",
    OTHER: "Otro",
  },
  action: {
    OVERHAUL: "Overhaul",
    REPLACE: "Reemplazo",
    REPAIR: "Reparación",
    INSPECTION: "Inspección",
    FUNCTIONAL_CHECK: "Chequeo funcional",
    CERTIFICATION: "Certificación",
    CALIBRATION: "Calibración",
    REPLACEMENT: "Reemplazo",
    DATA_DOWNLOAD: "Descarga de datos",
  },
  applicability: {
    PENDING_ANALYSIS: "Pendiente de análisis",
    APPLICABLE: "Aplicable",
    NOT_APPLICABLE: "No aplicable",
    SUPERSEDED: "Reemplazada",
  },
  compliance_type: { ONE_TIME: "Única vez", RECURRENT: "Recurrente" },
  status: { OPEN: "Abierta", CLOSED: "Cerrada", PROCESO: "En proceso" },
  document: {
    "INAC-43-008": "Formato INAC-43-008",
    SNAPSHOT: "Estado a una fecha (PDF)",
    REPORT_SHEET: "Hoja de reporte",
    WORK_ORDER_PACKAGE: "Paquete de la OT",
    PRELIMINARY_INSPECTION: "Inspección preliminar",
    AUDIT_EXCEL: "Auditoría en Excel",
    AUDIT_RECORD_PDF: "Historial de auditoría (PDF)",
  },
  aircraft_hours_mode: { auto: "Las del sistema", manual: "Escritas a mano" },
  is_hazardous: YES_NO,
  is_on_condition: YES_NO,
  is_historical: YES_NO,
  has_reference_manual: YES_NO,
  needs_task: YES_NO,
};

/** Los ids que tienen nombre conocido en el cliente. */
export type AuditLookups = Partial<Record<string, Record<string, string>>>;

const INSTANT = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/;

/**
 * Valor tal como se guardó, legible: códigos traducidos, ids con nombre, y
 * los instantes en la zona de la compañía. Una fecha de calendario no se
 * convierte (formatInstant ya la reconoce y la respeta).
 */
export const formatAuditValue = (
  field: string,
  value: string | null,
  timeZone: string,
  lookups: AuditLookups = {},
): string => {
  if (value === null || value === "") return "—";

  const named = lookups[field]?.[value] ?? VALUE_LABELS[field]?.[value];
  if (named) return named;

  if (INSTANT.test(value))
    return formatInstant(value, timeZone, "dateTime", value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(value))
    return formatInstant(value, timeZone, "date", value);

  return value;
};

/** Vínculos al padre: la referencia de la entrada ya dice de qué control u OT es. */
export const STRUCTURAL_FIELDS = new Set([
  "maintenance_control_id",
  "maintenance_control_part_id",
  "maintenance_control_item_id",
  "component_control_id",
  "component_control_item_id",
  "avionics_control_id",
  "avionics_control_item_id",
  "avionics_control_task_id",
  "directive_control_id",
  "directive_control_item_id",
  "work_order_task_id",
  "non_routine_id",
  "preliminary_inspection_id",
]);
