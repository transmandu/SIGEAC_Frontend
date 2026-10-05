import type {
  CatalogCategory,
  CatalogCountingMethod,
  CatalogRequirementType,
  CatalogStatus,
  Msg3TaskType,
} from "@/types/maintenanceCatalog";

// El backend guarda categoría/tipo en inglés (const en el modelo); el
// frontend traduce para mostrar, igual que el resto de estados de SIGEAC.
export const CATEGORY_LABELS: Record<CatalogCategory, string> = {
  SERVICE: "Servicio",
  CERTIFICATE: "Certificado",
};

export const STATUS_LABELS: Record<CatalogStatus, string> = {
  ACTIVE: "Vigente",
  SUPERSEDED: "Superado",
};

export const COUNTING_METHOD_LABELS: Record<CatalogCountingMethod, string> = {
  HOURS: "Horas",
  CYCLES: "Ciclos",
  DAYS: "Días",
};

// Taxonomía MSG-3 de tipos de tarea de mantenimiento programado.
export const MSG3_TYPE_LABELS: Record<Msg3TaskType, string> = {
  LUBRICATION_SERVICING: "Lubricación / Servicio",
  OPERATIONAL_CHECK: "Chequeo Operacional",
  VISUAL_CHECK: "Chequeo Visual",
  GENERAL_VISUAL_INSPECTION: "Inspección Visual General",
  DETAILED_INSPECTION: "Inspección Detallada",
  SPECIAL_DETAILED_INSPECTION: "Inspección Especial Detallada",
  RESTORATION: "Restauración",
  DISCARD: "Descarte",
  FUNCTIONAL_CHECK: "Chequeo Funcional",
};

export const REQUIREMENT_TYPE_LABELS: Record<CatalogRequirementType, string> = {
  PART: "Parte",
  TOOL: "Herramienta",
  CONSUMABLE: "Consumible",
  COMPONENT: "Componente",
  GENERAL: "General",
};
