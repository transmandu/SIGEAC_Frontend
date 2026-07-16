import { StepType } from "@reactour/tour";

export const resumenSteps: StepType[] = [
  {
    selector: '[data-tour="resumen-header"]',
    content: "Consulte el historial de capacitación del personal por empleado.",
    position: "center",
  },
  {
    selector: '[data-tour="resumen-search"]',
    content: "Busque empleados por nombre o DNI.",
    position: "bottom",
  },
  {
    selector: '[data-tour="resumen-lista"]',
    content:
      "Haga clic en un empleado para desplegar su perfil de capacitación: cursos, certificados y exámenes.",
    position: "bottom",
  },
];
