import { StepType } from "@reactour/tour";

export const comerciosSteps: StepType[] = [
  {
    selector: '[data-tour="comercios-title"]',
    content:
      "Gestione los comercios y lugares de compra registrados en el sistema. Cada comercio tiene nombre, teléfono y ubicación asociada.",
    position: "center",
  },
  {
    selector: '[data-tour="comercios-table"]',
    content:
      "Cada fila muestra el nombre del comercio, su número de teléfono y ubicación. Use las acciones disponibles para editarlo o eliminarlo.",
    position: "top",
  },
  {
    selector: '[data-tour="comercios-new"]',
    content:
      "Cree un nuevo comercio. Debe ingresar un nombre, y opcionalmente un teléfono y una dirección.",
    position: "left",
  },
  {
    selector: '[data-tour="comercios-actions"]',
    content:
      "Edite los datos del comercio o elimínelo. La eliminación requiere confirmación.",
    position: "left",
  },
  {
    selector: '[data-tour="comercios-pagination"]',
    content:
      "Navegue entre las páginas de resultados usando los controles de paginación.",
    position: "bottom",
  },
];
