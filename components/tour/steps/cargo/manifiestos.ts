import { StepType } from "@reactour/tour";

export const cargoManifiestosSteps: StepType[] = [
  {
    selector: '[data-tour="cargo-manifiestos-title"]',
    content:
      "Panel de Manifiestos de Carga. Agrupa guías en un despacho.",
    position: "center",
  },
  {
    selector: '[data-tour="cargo-manifiestos-fecha"]',
    content: "Filtra manifiestos por fecha.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cargo-manifiestos-aeronave"]',
    content: "Filtra por aeronave disponible.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cargo-manifiestos-btn-nuevo"]',
    content: "Crea un nuevo manifiesto.",
    position: "left",
  },
  {
    selector: '[data-tour="cargo-manifiestos-tabla"]',
    content:
      "Listado de manifiestos con acciones disponibles.",
    position: "top",
  },
];