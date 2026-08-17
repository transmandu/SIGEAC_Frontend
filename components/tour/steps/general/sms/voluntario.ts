import { StepType } from "@reactour/tour";

export const voluntarioSteps: StepType[] = [
  {
    selector: '[data-tour="voluntario-header"]',
    content:
      "Formulario para reportar un peligro de forma voluntaria. Complete los datos solicitados para generar el reporte en el sistema.",
    position: "center",
  },
  {
    selector: '[data-tour="voluntario-fechas"]',
    content:
      "Seleccione la fecha del reporte y la fecha en que se identificó el peligro. Ambas son obligatorias.",
    position: "bottom",
  },
  {
    selector: '[data-tour="voluntario-localizacion"]',
    content:
      "Indique la base, el área de identificación y el lugar específico donde ocurre el peligro.",
    position: "bottom",
  },
  {
    selector: '[data-tour="voluntario-detalle"]',
    content:
      "Describa el peligro detectado y agregue las posibles consecuencias. Presione Enter o el botón + para añadir cada una.",
    position: "bottom",
  },
  {
    selector: '[data-tour="voluntario-reportante"]',
    content:
      "Marque la casilla para realizar el reporte de forma anónima, o desmárquela para completar sus datos de contacto.",
    position: "bottom",
  },
  {
    selector: '[data-tour="voluntario-archivos"]',
    content:
      "Adjunte una imagen (JPEG/PNG, máx 10MB) y/o un documento PDF como evidencia del peligro reportado.",
    position: "bottom",
  },
  {
    selector: '[data-tour="voluntario-submit"]',
    content:
      "Revise la información ingresada y presione para enviar el reporte voluntario al sistema.",
    position: "top",
  },
];
