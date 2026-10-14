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
      "Cada fila muestra el nombre de la condición, su descripción y si lo que sale en ella suma o no al costo de los reportes. Use las acciones disponibles para editar o eliminar.",
    position: "top",
  },
  {
    selector: '[data-tour="condiciones-new"]',
    content:
      "Registre una nueva condición. Indique el nombre, una descripción y, si lo que sale en esa condición (por ejemplo, resguardo) no debe sumar al costo, marque «No cuenta como gasto».",
    position: "left",
  },
  {
    selector: '[data-tour="condiciones-actions"]',
    content:
      "Acciones por condición: editar sus datos o eliminarla. Una condición que no cuenta como gasto y ya tiene salidas registradas no puede eliminarse.",
    position: "left",
  },
  {
    selector: '[data-tour="condiciones-pagination"]',
    content:
      "Navegue entre las páginas de resultados usando los controles de paginación.",
    position: "bottom",
  },
];
