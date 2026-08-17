import { StepType } from "@reactour/tour";

export const bibliotecaEliminarSteps: StepType[] = [
  {
    selector: '[data-tour="biblioteca-delete-title"]',
    content: "Elimine una versión específica o el documento completo del sistema.",
    position: "center",
  },
  {
    selector: '[data-tour="biblioteca-delete-version"]',
    content: "Elimine solo una versión específica. El documento principal se conserva con la versión anterior.",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-delete-document"]',
    content: "Elimine el documento completo incluyendo todo su historial de versiones.",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-delete-submit"]',
    content: "Confirme la eliminación. Esta acción no se puede deshacer.",
    position: "top",
  },
];