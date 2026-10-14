import { ControlItemFlag } from "@/types";

// Los códigos viven en inglés en el backend (ControlItemFlag::FLAGS); acá solo
// se traducen. Una bandera nueva se agrega en ambos lados y aquí.

export const CONTROL_ITEM_FLAG_LABELS: Record<ControlItemFlag, string> = {
  HAZARDOUS: "Mercancía peligrosa",
  EMERGENCY_EQUIPMENT: "Equipo de emergencia",
};

export const CONTROL_ITEM_FLAGS = Object.keys(
  CONTROL_ITEM_FLAG_LABELS,
) as ControlItemFlag[];
