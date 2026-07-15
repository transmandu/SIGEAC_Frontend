import { StepType } from "@reactour/tour";

export const bibliotecaVersionesSteps: StepType[] = [
  {
    selector: '[data-tour="biblioteca-versions-title"]',
    content: "Historial de versiones del documento. Vea todos los cambios realizados.",
    position: "center",
  },
  {
    selector: '[data-tour="biblioteca-versions-timeline"]',
    content: "Línea de tiempo con cada versión registrada, su estado y fecha de carga.",
    position: "top",
  },
  {
    selector: '[data-tour="biblioteca-version-view-btn"]',
    content: "Haga clic en 'Ver' para visualizar una versión específica del documento.",
    position: "top",
  },
];