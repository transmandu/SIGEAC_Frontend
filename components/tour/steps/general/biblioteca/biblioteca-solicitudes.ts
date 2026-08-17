import { StepType } from "@reactour/tour";

export const bibliotecaSolicitudesSteps: StepType[] = [
  {
    selector: '[data-tour="biblioteca-requests-title"]',
    content:
      "Gestione las solicitudes de acceso a documentos enviadas por usuarios externos.",
    position: "center",
  },
  {
    selector: '[data-tour="biblioteca-requests-tab-pendientes"]',
    content:
      "Filtre las solicitudes por estado: Pendientes, Aprobadas o Rechazadas.",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-requests-card"]',
    content:
      "Cada tarjeta muestra el detalle de la solicitud: documento, solicitante y motivo.",
    position: "top",
  },
  {
    selector: '[data-tour="biblioteca-requests-close"]',
    content: "Cierre el panel de solicitudes.",
    position: "right",
  },
];
