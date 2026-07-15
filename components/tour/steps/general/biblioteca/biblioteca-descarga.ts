import { StepType } from "@reactour/tour";

export const bibliotecaDescargaSteps: StepType[] = [
  {
    selector: '[data-tour="biblioteca-download-title"]',
    content: "Seleccione qué versión del documento desea descargar.",
    position: "center",
  },
  {
    selector: '[data-tour="biblioteca-download-current"]',
    content: "Descargue el documento vigente (la versión más reciente).",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-download-version"]',
    content: "O seleccione una versión específica del historial para descargar.",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-download-submit"]',
    content: "Inicie la descarga del archivo PDF seleccionado.",
    position: "top",
  },
];