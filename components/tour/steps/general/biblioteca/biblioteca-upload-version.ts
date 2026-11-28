import { StepType } from "@reactour/tour";

export const bibliotecaUploadVersionSteps: StepType[] = [
  {
    selector: '[data-tour="biblioteca-version-title"]',
    content:
      "Suba una nueva versión de un documento existente manteniendo el historial de cambios. La nueva versión pasa a ser la vigente.",
    position: "center",
  },
  {
    selector: '[data-tour="biblioteca-version-dropzone"]',
    content:
      "Seleccione el archivo nuevo o arrástrelo aquí. Se aceptan PDF y Excel de hasta 10 MB.",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-version-justificacion"]',
    content:
      "Describa el motivo del cambio (obligatorio). Este registro quedará en el historial de versiones.",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-version-label"]',
    content:
      "Etiqueta opcional para identificar esta versión (por ejemplo, «Revisión SMS 2026»).",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-version-vigencia"]',
    content:
      "La vigencia parte de la del documento actual. Si la versión tiene vencimiento, indique su nueva fecha.",
    position: "top",
  },
  {
    selector: '[data-tour="biblioteca-version-submit"]',
    content: "Suba la nueva versión. El historial conservará la anterior.",
    position: "top",
  },
];
