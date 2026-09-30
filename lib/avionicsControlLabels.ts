import { AvionicsAction } from "@/types";

// Valores en inglés en el backend (AvionicsControlTask::ACTIONS); acá solo se
// traducen.

export const AVIONICS_ACTION_LABELS: Record<AvionicsAction, string> = {
  FUNCTIONAL_CHECK: "Chequeo",
  CERTIFICATION: "Certificación",
  CALIBRATION: "Calibración",
  REPLACEMENT: "Reemplazo",
  DATA_DOWNLOAD: "Descarga de datos",
};
