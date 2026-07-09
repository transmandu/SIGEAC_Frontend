import { StepType } from "@reactour/tour";

export const cargoManifiestoEditarSteps: StepType[] = [
  {
    selector: '[data-tour="cargo-manifiestos-editar-header"]',
    content: "Formulario para editar un manifiesto existente.",
    position: "center",
  },
  {
    selector: '[data-tour="cargo-manifiestos-editar-btn-volver"]',
    content: "Botón para volver a la lista de manifiestos.",
    position: "right",
  },
  {
    selector: '[data-tour="cargo-manifiestos-editar-existentes"]',
    content:
      "Productos actualmente incluidos en el manifiesto.",
    position: "top",
  },
  {
    selector: '[data-tour="cargo-manifiestos-editar-item-unidades"]',
    content:
      "Ajustar las unidades a despachar.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cargo-manifiestos-editar-item-peso"]',
    content:
      "Ajustar el peso a despachar.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cargo-manifiestos-editar-item-quitar"]',
    content:
      "Eliminar este producto del manifiesto. La guía recupera disponibilidad y el sistema recalcula el estado de despacho.",
    position: "left",
  },
  {
    selector: '[data-tour="cargo-manifiestos-editar-disponibles"]',
    content:
      "Productos disponibles para agregar al manifiesto.",
    position: "top",
  },
  {
    selector: '[data-tour="cargo-manifiestos-editar-footer"]',
    content:
      "Resumen total y acciones de guardado.",
    position: "top",
  },
];