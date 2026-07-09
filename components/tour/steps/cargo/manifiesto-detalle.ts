import { StepType } from "@reactour/tour";

export const cargoManifiestoDetalleSteps: StepType[] = [
  {
    selector: '[data-tour="cargo-manifiestos-detalle-header"]',
    content: "Encabezado del manifiesto. Muestra el número de manifiesto y la aeronave.",
    position: "center",
  },
  {
    selector: '[data-tour="cargo-manifiestos-detalle-btn-volver"]',
    content: "Botón para volver a la lista de manifiestos.",
    position: "left",
  },
  {
    selector: '[data-tour="cargo-manifiestos-detalle-card-generales"]',
    content: "Datos generales del manifiesto: mes, año y número de manifiesto.",
    position: "right",
  },
  {
    selector: '[data-tour="cargo-manifiestos-detalle-card-info"]',
    content: "Información de creación y última actualización del manifiesto.",
    position: "left",
  },
  {
    selector: '[data-tour="cargo-manifiestos-detalle-guias"]',
    content: "Lista de guías incluidas en este manifiesto. Expande cada fila para ver el detalle de productos.",
    position: "top",
  },
];
