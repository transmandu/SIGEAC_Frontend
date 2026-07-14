import { StepType } from "@reactour/tour";

export const bibliotecaShareSteps: StepType[] = [
  {
    selector: '[data-tour="biblioteca-share-title"]',
    content: "Comparta un documento con usuarios externos de forma segura.",
    position: "center",
  },
  {
    selector: '[data-tour="biblioteca-share-tab-generar"]',
    content: "Genere un nuevo acceso o solicite compartir el documento.",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-share-version"]',
    content: "Seleccione la versión del documento que desea compartir.",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-share-duracion"]',
    content: "Defina por cuánto tiempo estará disponible el acceso.",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-share-destinatario"]',
    content:
      "Opcional. Especifique el destinatario del acceso para llevar un control de quién recibió el enlace.",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-share-motivo"]',
    content: "Indique el motivo de la compartición.",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-share-readonly"]',
    content:
      "Active esta opción para que el destinatario solo pueda ver el documento sin descargarlo.",
    position: "bottom",
  },

  {
    selector: '[data-tour="biblioteca-share-submit"]',
    content: "Genere el enlace de acceso o envíe la solicitud de compartición.",
    position: "top",
  },
];
