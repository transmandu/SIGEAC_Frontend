import { StepType } from "@reactour/tour";

export const cursosIndexSteps: StepType[] = [
  {
    selector: '[data-tour="cursos-header"]',
    content: "Visualice todos los cursos registrados en el sistema.",
    position: "center",
  },
  {
    selector: '[data-tour="cursos-create-btn"]',
    content: "Presione para crear un nuevo curso en el sistema.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cursos-columns"]',
    content: "Personalice qué columnas se muestran en la tabla.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cursos-table"]',
    content:
      "Lista de cursos con fechas, instructor y estado. Los colores indican el estado del curso.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cursos-actions"]',
    content:
      "Cada curso tiene un menú de acciones. Púlselo para editar, eliminar, agregar personas o gestionar exámenes.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cursos-pagination"]',
    content: "Navegue entre las páginas de resultados.",
    position: "bottom",
  },
];
