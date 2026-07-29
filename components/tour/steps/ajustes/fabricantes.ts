import { StepType } from "@reactour/tour";

export const fabricantesSteps: StepType[] = [
  {
    selector: '[data-tour="fabricantes-title"]',
    content:
      "Gestione los fabricantes registrados en el sistema. Cada fabricante tiene un nombre, tipo y descripción asociada.",
    position: "center",
  },
  {
    selector: '[data-tour="fabricantes-table"]',
    content:
      "Cada fila muestra el nombre del fabricante, su descripción y las acciones disponibles para editarlo o eliminarlo.",
    position: "top",
  },
  {
    selector: '[data-tour="fabricantes-new"]',
    content:
      "Cree un nuevo fabricante. Debe ingresar un nombre, seleccionar un tipo (Aeronave, Motor, APU, etc.) y opcionalmente una descripción.",
    position: "left",
  },
  {
    selector: '[data-tour="fabricantes-actions"]',
    content:
      "Edite los datos del fabricante o elimínelo. La eliminación requiere confirmación.",
    position: "left",
  },
  {
    selector: '[data-tour="fabricantes-pagination"]',
    content:
      "Navegue entre las páginas de resultados usando los controles de paginación.",
    position: "bottom",
  },
];
