import { StepType } from "@reactour/tour";

export const fabricantesSteps: StepType[] = [
  {
    selector: '[data-tour="fabricantes-title"]',
    content:
      "Fabricantes registrados para aeronaves, partes y artículos. Cada uno tiene una abreviatura, un nombre completo y un tipo.",
    position: "center",
  },
  {
    selector: '[data-tour="fabricantes-toolbar"]',
    content:
      "Busque por abreviatura, nombre o tipo y filtre por tipo (Aeronave, Plantas de Poder, APU, Hélice, Piezas en General, Partes/Componentes o Herramientas).",
    position: "top",
  },
  {
    selector: '[data-tour="fabricantes-new"]',
    content:
      "Cree un fabricante: abreviatura (ej. Boeing), nombre completo (ej. The Boeing Company) y tipo.",
    position: "left",
  },
  {
    selector: '[data-tour="fabricantes-table"]',
    content:
      "Cada fila muestra la abreviatura, el nombre completo y el tipo del fabricante.",
    position: "top",
  },
  {
    selector: '[data-tour="fabricantes-actions"]',
    content:
      "Edite los datos del fabricante o elimínelo. La eliminación pide confirmación.",
    position: "left",
  },
  {
    selector: '[data-tour="fabricantes-pagination"]',
    content: "Navegue entre las páginas de resultados.",
    position: "bottom",
  },
];
