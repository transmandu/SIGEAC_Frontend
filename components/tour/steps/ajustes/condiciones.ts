import { StepType } from "@reactour/tour";

export const condicionesSteps: StepType[] = [
  {
    selector: '[data-tour="condiciones-title"]',
    content:
      "Condiciones que puede tener un artículo del almacén (usado, reparable, resguardo…).",
    position: "center",
  },
  {
    selector: '[data-tour="condiciones-toolbar"]',
    content: "Busque condiciones por nombre o descripción.",
    position: "top",
  },
  {
    selector: '[data-tour="condiciones-new"]',
    content:
      "Cree una condición: nombre y descripción. Active «No cuenta como gasto» si lo que sale en esa condición (por ejemplo, resguardo) no debe sumar al costo.",
    position: "left",
  },
  {
    selector: '[data-tour="condiciones-table"]',
    content:
      "Cada fila muestra el nombre, la descripción y si la condición cuenta o no en los reportes de costo.",
    position: "top",
  },
  {
    selector: '[data-tour="condiciones-actions"]',
    content:
      "Edite la condición o elimínela. Una condición que no cuenta como gasto y ya tiene salidas registradas no puede eliminarse.",
    position: "left",
  },
  {
    selector: '[data-tour="condiciones-pagination"]',
    content: "Navegue entre las páginas de resultados.",
    position: "bottom",
  },
];
