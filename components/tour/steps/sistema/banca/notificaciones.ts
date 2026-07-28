import { StepType } from "@reactour/tour";

export const notificacionesSteps: StepType[] = [
  {
    selector: '[data-tour="notificaciones-title"]',
    content:
      "Consulte las notificaciones generadas por el sistema. Aquí encontrará eventos, aprobaciones y actividades relevantes.",
    position: "center",
  },
  {
    selector: '[data-tour="notificaciones-toolbar"]',
    content:
      "Busque notificaciones por título, mensaje o tipo. Use el filtro para ver todas, leídas o no leídas.",
    position: "bottom",
  },
  {
    selector: '[data-tour="notificaciones-list"]',
    content:
      "Cada notificación muestra el título, mensaje y estado (Nueva/Leída). Haga clic para ir al recurso relacionado o pase el cursor y presione ✓ para marcar como leída.",
    position: "top",
  },
];
