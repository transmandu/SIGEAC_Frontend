import { StepType } from "@reactour/tour";

export const cargoGuiaDetalleSteps: StepType[] = [
  {
    selector: '[data-tour="cargo-detalle-title"]',
    content:
      "Detalle completo de la guía de carga.",
    position: "center",
  },
  {
    selector: '[data-tour="cargo-detalle-card-generales"]',
    content:
      "Información general: fecha, emisor y transportista.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cargo-detalle-card-cliente"]',
    content:
      "Datos del cliente o remitente de la carga.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cargo-detalle-card-vuelo"]',
    content:
      "Información del vuelo: aeronave, piloto y copiloto.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cargo-detalle-manifiesto"]',
    content:
      "Detalle de productos con unidades y pesos. Incluye totales finales.",
    position: "top",
  },
];