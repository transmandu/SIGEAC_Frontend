import { StepType } from "@reactour/tour";

export const bibliotecaVisualizadorSteps: StepType[] = [
  {
    selector: '[data-tour="biblioteca-viewer-title"]',
    content:
      "Visor seguro de documentos. Desde aquí no se puede copiar ni guardar el contenido.",
    position: "center",
  },
  {
    selector: '[data-tour="biblioteca-viewer-toolbar"]',
    content: "Controles de zoom, navegación entre páginas y pantalla completa.",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-viewer-close"]',
    content: "Cierre el visor y vuelva a la biblioteca (también con Esc).",
    position: "bottom",
  },
];
