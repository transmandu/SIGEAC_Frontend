import { StepType } from "@reactour/tour";

export const estadisticasSteps: StepType[] = [
  {
    selector: '[data-tour="estadisticas-header"]',
    content: "Visualice las estadísticas de cursos por rango de fechas.",
    position: "center",
  },
  {
    selector: '[data-tour="estadisticas-filtro"]',
    content:
      "Seleccione un rango de fechas para filtrar los datos mostrados en los gráficos.",
    position: "bottom",
  },
  {
    selector: '[data-tour="estadisticas-barras"]',
    content:
      "Gráfico de barras que compara cursos planificados vs ejecutados en el período seleccionado.",
    position: "bottom",
  },
  {
    selector: '[data-tour="estadisticas-pastel"]',
    content:
      "Gráfico circular que muestra el porcentaje de cursos planificados y ejecutados.",
    position: "bottom",
  },
];
