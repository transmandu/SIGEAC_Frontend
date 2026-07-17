import { StepType } from "@reactour/tour";

export const cursosCrearSteps: StepType[] = [
  {
    selector: '[data-tour="cursos-create-dialog"]',
    content: "Complete los datos para registrar un nuevo curso en el sistema.",
    position: "center",
  },
  {
    selector: '[data-tour="cursos-create-nombre"]',
    content: "Ingrese el nombre del curso.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cursos-create-tipo"]',
    content: "Seleccione el tipo: RECURRENTE o INICIAL.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cursos-create-fechas"]',
    content: "Seleccione la fecha y hora de inicio del curso.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cursos-create-fin"]',
    content: "Seleccione la fecha y hora de finalización.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cursos-create-descripcion"]',
    content: "Describa el contenido y objetivos del curso.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cursos-create-instructor"]',
    content: "Asigne el instructor encargado del curso.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cursos-create-submit"]',
    content: "Revise la información y presione para guardar el curso.",
    position: "top",
  },
];
