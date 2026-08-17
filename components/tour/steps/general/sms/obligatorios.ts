import { StepType } from "@reactour/tour";

export const obligatorioSteps: StepType[] = [
  {
    selector: '[data-tour="obligatorio-header"]',
    content:
      "Formulario para reportar un suceso de forma obligatoria. Complete la información requerida para generar el reporte en el sistema.",
    position: "center",
  },
  {
    selector: '[data-tour="obligatorio-ubicacion"]',
    content: "Indique el lugar exacto donde ocurrió el incidente.",
    position: "bottom",
  },
  {
    selector: '[data-tour="obligatorio-descripcion"]',
    content:
      "Describa el suceso ocurrido con el mayor detalle posible para facilitar su análisis.",
    position: "bottom",
  },
  {
    selector: '[data-tour="obligatorio-fechas"]',
    content:
      "Seleccione la fecha y hora del incidente, y la fecha y hora del reporte. Ambas son obligatorias.",
    position: "bottom",
  },
  {
    selector: '[data-tour="obligatorio-horas-vuelo"]',
    content:
      "Registre la hora de vuelo y la hora del incidente. Use el formato de 24 horas.",
    position: "bottom",
  },
  {
    selector: '[data-tour="obligatorio-pilotos"]',
    content:
      "Seleccione el Capitán y el Primer Oficial asignados al vuelo desde la lista de pilotos registrados.",
    position: "bottom",
  },
  {
    selector: '[data-tour="obligatorio-aeronave"]',
    content: "Seleccione la matrícula de la aeronave involucrada en el suceso.",
    position: "bottom",
  },
  {
    selector: '[data-tour="obligatorio-vuelo"]',
    content:
      "Complete los datos del vuelo: número, origen, destino y destino alterno.",
    position: "bottom",
  },
  {
    selector: '[data-tour="obligatorio-incidentes"]',
    content:
      "Seleccione uno o más incidentes de la lista predefinida, o marque 'Otros incidentes' para escribir uno personalizado.",
    position: "bottom",
  },
  {
    selector: '[data-tour="obligatorio-archivos"]',
    content:
      "Adjunte una imagen y/o documento PDF como evidencia del suceso reportado.",
    position: "bottom",
  },
  {
    selector: '[data-tour="obligatorio-submit"]',
    content:
      "Revise la información y presione para enviar el reporte obligatorio al sistema.",
    position: "top",
  },
];
