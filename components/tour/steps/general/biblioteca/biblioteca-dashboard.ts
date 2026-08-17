import { StepType } from "@reactour/tour";

export const bibliotecaDashboardSteps: StepType[] = [
  {
    selector: '[data-tour="biblioteca-dashboard-title"]',
    content:
      "Panel de estadísticas de la biblioteca digital. Visualice métricas y gráficos.",
    position: "center",
  },
  {
    selector: '[data-tour="biblioteca-dashboard-distribucion"]',
    content:
      "Distribución de documentos por departamento. Visualice qué áreas tienen más documentos.",
    position: "top",
  },
  {
    selector: '[data-tour="biblioteca-dashboard-accesos"]',
    content:
      "Documentos más accedidos externamente mediante enlaces compartidos.",
    position: "top",
  },
  {
    selector: '[data-tour="biblioteca-dashboard-solicitudes"]',
    content:
      "Estado de las solicitudes de acceso: aprobadas, pendientes y rechazadas.",
    position: "top",
  },
  {
    selector: '[data-tour="biblioteca-dashboard-metrics"]',
    content:
      "Métricas clave: total de documentos, compartidos, accesos y solicitudes.",
    position: "top",
  },
];
