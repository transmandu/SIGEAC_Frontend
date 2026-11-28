import { StepType } from "@reactour/tour";

export const notificacionesSteps: StepType[] = [
  {
    selector: '[data-tour="notificaciones-title"]',
    content:
      "Bandeja de notificaciones del sistema: eventos, aprobaciones, recordatorios y avisos que le corresponden, agrupados por día.",
    position: "center",
  },
  {
    selector: '[data-tour="notificaciones-toolbar"]',
    content:
      "Busque por título, mensaje, tipo o número (orden, solicitud, parte). Filtre por Estado (todas, no leídas, leídas) y, cuando haya de varias clases, por Área y por Tipo de aviso.",
    position: "top",
  },
  {
    selector: '[data-tour="notificaciones-mark-all"]',
    content: "Marque todas las notificaciones como leídas de una vez.",
    position: "bottom",
  },
  {
    selector: '[data-tour="notificaciones-clear"]',
    content:
      "Elimine las ya leídas o todas (pide confirmación y no se puede deshacer). Solo lo ven los roles autorizados.",
    position: "bottom",
  },
  {
    selector: '[data-tour="notificaciones-list"]',
    content:
      "Cada notificación lleva el color de su clase: rojo lo que bloquea o falla, ámbar los recordatorios y lo que vence, verde lo resuelto y azul lo demás. Haga clic para ir al recurso relacionado; al apuntarla aparece ✓ para marcarla como leída. Al final, «Mostrar más» carga las anteriores.",
    position: "top",
  },
];
