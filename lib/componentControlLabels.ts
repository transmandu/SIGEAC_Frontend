import {
  ComponentAction,
  ComponentCategory,
  ComponentLimitKind,
} from "@/types";

// Los valores viven en inglés en el backend (ComponentControlItem::CATEGORIES,
// ::ACTIONS, ComponentControlItemInterval::LIMIT_KINDS); acá solo se traducen.

export const COMPONENT_CATEGORY_LABELS: Record<ComponentCategory, string> = {
  LANDING_GEAR: "Tren de aterrizaje",
  ENGINE_ACCESSORY: "Accesorio de motor",
  ENGINE_LLP: "Parte de vida limitada (motor)",
  PROPELLER: "Hélice",
  AVIONICS: "Aviónica",
  EMERGENCY_EQUIPMENT: "Equipo de emergencia",
  HYDRAULIC_PNEUMATIC: "Hidráulico / Neumático",
  FUEL_SYSTEM: "Sistema de combustible",
  ELECTRICAL: "Eléctrico",
  STRUCTURE: "Estructura",
  OTHER: "Otro",
};

export const COMPONENT_ACTION_LABELS: Record<ComponentAction, string> = {
  OVERHAUL: "Overhaul",
  REPLACE: "Reemplazo",
  REPAIR: "Reparación",
  INSPECTION: "Inspección",
};

export const COMPONENT_LIMIT_KIND_LABELS: Record<ComponentLimitKind, string> = {
  HARD_TIME: "Hard Time",
  LIFE_LIMIT: "Life Limit",
};
