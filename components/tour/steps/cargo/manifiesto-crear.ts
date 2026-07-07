import { StepType } from "@reactour/tour";

export const cargoManifiestoCrearSteps: StepType[] = [
  {
    selector: '[data-tour="cargo-manifiestos-nuevo-title"]',
    content: "Formulario para crear un nuevo manifiesto agrupando guías de carga.",
    position: "center",
  },
  {
    selector: '[data-tour="cargo-manifiestos-nuevo-btn-volver"]',
    content: "Volver al listado de manifiestos.",
    position: "right",
  },
  {
    selector: '[data-tour="cargo-manifiestos-nuevo-fecha"]',
    content: "Fecha del manifiesto.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cargo-manifiestos-nuevo-aeronave"]',
    content: "Listado de aeronave para filtrar guías disponibles.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cargo-manifiestos-nuevo-numero"]',
    content: "Número de manifiesto generado automáticamente.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cargo-manifiestos-nuevo-guias"]',
    content: "Lista de guías disponibles para incluir en el manifiesto.",
    position: "top",
  },
  {
    selector: '[data-tour="cargo-manifiestos-nuevo-seleccionar-todos"]',
    content: "Seleccionar o deseleccionar todos los productos.",
    position: "right",
  },
  {
    selector: '[data-tour="cargo-manifiestos-nuevo-item-checkbox"]',
    content: "Seleccionar el producto para incluirlo.",
    position: "right",
  },
  {
    selector: '[data-tour="cargo-manifiestos-nuevo-item-unidades"]',
    content:
      "Cantidad de unidades a despachar. No puede exceder lo disponible.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cargo-manifiestos-nuevo-item-peso"]',
    content:
      "Peso a despachar. Debe ingresarse manualmente dentro de los límites disponibles.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cargo-manifiestos-nuevo-generar"]',
    content: "Genera el manifiesto con los ítems seleccionados.",
    position: "top",
  },
];
