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
      "Cada notificación muestra el título, el mensaje y su estado (Nueva/Leída); el color indica el tipo de aviso: rojo lo que bloquea o falla, ámbar los recordatorios, verde lo resuelto y azul lo demás. Toque o haga clic para ir al recurso relacionado, o use el botón ✓ para marcarla como leída. Arriba puede marcar todas como leídas o eliminar las que ya no necesite.",
    position: "top",
  },
];
