import { StepType } from "@reactour/tour";

export const condicionesSteps: StepType[] = [
  {
    selector: '[data-tour="condiciones-title"]',
    content:
      "Gestione las condiciones registradas en el sistema. Cada condición define un estado posible para los artículos del almacén.",
    position: "center",
  },
  {
    selector: '[data-tour="condiciones-table"]',
    content:
      "Cada fila muestra el nombre de la condición y su descripción. Puede crear nuevas condiciones con el botón superior.",
    position: "top",
  },
  {
    selector: '[data-tour="condiciones-new"]',
    content:
      "Registre una nueva condición. Solo necesita ingresar el nombre y una descripción que explique su significado.",
    position: "left",
  },
  {
    selector: '[data-tour="condiciones-pagination"]',
    content:
      "Navegue entre las páginas de resultados usando los controles de paginación.",
    position: "bottom",
  },
];
