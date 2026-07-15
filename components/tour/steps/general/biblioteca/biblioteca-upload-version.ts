import { StepType } from "@reactour/tour";

export const bibliotecaUploadVersionSteps: StepType[] = [
  {
    selector: '[data-tour="biblioteca-version-title"]',
    content:
      "Suba una nueva versión de un documento existente manteniendo el historial de cambios.",
    position: "center",
  },
  {
    selector: "[data-tour='biblioteca-version-documento']",
    content: "Documento que se está actualizando.",
    position: "center",
  },
  {
    selector: '[data-tour="biblioteca-version-dropzone"]',
    content:
      "Arrastre o seleccione el nuevo archivo PDF. Solo se aceptan archivos PDF.",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-version-vigencia"]',
    content:
      "La vigencia se hereda del documento original. Si el documento tiene vencimiento, puede actualizar la fecha.",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-version-justificacion"]',
    content:
      "Describa el motivo del cambio. Este registro quedará en el historial de versiones.",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-version-label"]',
    content:
      "Etiqueta opcional para identificar esta versión (ej. 'Revisión SMS 2026').",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-version-submit"]',
    content:
      "Suba la nueva versión. El documento se actualizará y el historial conservará la versión anterior.",
    position: "top",
  },
];
