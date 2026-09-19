import { AvionicsAction, AvionicsCategory } from "@/types";

// Valores en inglés en el backend (AvionicsControlItem::CATEGORIES,
// AvionicsControlTask::ACTIONS); acá solo se traducen.

export const AVIONICS_CATEGORY_LABELS: Record<AvionicsCategory, string> = {
  FLIGHT_INSTRUMENTS: "Instrumentos de vuelo",
  NAVIGATION: "Navegación",
  COMMUNICATION: "Comunicaciones",
  SURVEILLANCE: "Vigilancia (ATC / TCAS)",
  RECORDERS: "Registradores (FDR / CVR / ULB)",
  EMERGENCY: "Emergencia (ELT)",
  AUTOPILOT: "Piloto automático",
  RADAR: "Radar",
  ELECTRICAL: "Eléctrico",
  OTHER: "Otro",
};

export const AVIONICS_ACTION_LABELS: Record<AvionicsAction, string> = {
  FUNCTIONAL_CHECK: "Chequeo",
  CERTIFICATION: "Certificación",
  CALIBRATION: "Calibración",
  REPLACEMENT: "Reemplazo",
  DATA_DOWNLOAD: "Descarga de datos",
};
