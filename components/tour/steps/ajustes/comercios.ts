import { StepType } from "@reactour/tour";

export const comerciosSteps: StepType[] = [
  {
    selector: '[data-tour="comercios-title"]',
    content:
      "Comercios y lugares de compra registrados en el sistema, con su teléfono y ubicación.",
    position: "center",
  },
  {
    selector: '[data-tour="comercios-toolbar"]',
    content: "Busque comercios por nombre, teléfono o dirección.",
    position: "top",
  },
  {
    selector: '[data-tour="comercios-new"]',
    content:
      "Cree un comercio: solo el nombre es obligatorio; el teléfono y la ubicación son opcionales.",
    position: "left",
  },
  {
    selector: '[data-tour="comercios-table"]',
    content:
      "Cada fila muestra el nombre del comercio, su teléfono y su ubicación.",
    position: "top",
  },
  {
    selector: '[data-tour="comercios-actions"]',
    content:
      "Edite los datos del comercio o elimínelo. La eliminación pide confirmación.",
    position: "left",
  },
  {
    selector: '[data-tour="comercios-pagination"]',
    content: "Navegue entre las páginas de resultados.",
    position: "bottom",
  },
];
