import { StepType } from "@reactour/tour";

export const bibliotecaEliminarSteps: StepType[] = [
  {
    selector: '[data-tour="biblioteca-delete-title"]',
    content:
      "Elija qué quitar: una versión específica o el documento completo.",
    position: "center",
  },
  {
    selector: '[data-tour="biblioteca-delete-version"]',
    content:
      "Elimine solo una versión. El documento sigue activo con la versión anterior y esta versión se borra para siempre.",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-delete-document"]',
    content:
      "Envíe el documento completo a la papelera. Deja de verse y sus enlaces dejan de funcionar, pero puede restaurarlo durante 30 días. Si es una réplica, solo se quita de esta carpeta.",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-delete-submit"]',
    content:
      "Confirme. Enviar a la papelera se puede deshacer; eliminar una versión no.",
    position: "top",
  },
];
