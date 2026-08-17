import { StepType } from "@reactour/tour";

export const bibliotecaVisualizadorSteps: StepType[] = [
  {
    selector: '[data-tour="biblioteca-viewer-title"]',
    content: "Visor seguro de documentos. Los archivos se visualizan mediante cifrado AES-256.",
    position: "center",
  },
  {
    selector: '[data-tour="biblioteca-viewer-toolbar"]',
    content: "Controles de zoom, navegación entre páginas y pantalla completa.",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-viewer-close"]',
    content: "Cierre el visor y vuelva a la biblioteca.",
    position: "bottom",
  },
];