import { StepType } from "@reactour/tour";

export const certificadosCrearSteps: StepType[] = [
  {
    selector: '[data-tour="cert-create-dialog"]',
    content: "Complete los datos para registrar un nuevo certificado.",
    position: "center",
  },
  {
    selector: '[data-tour="cert-create-empleado"]',
    content: "Seleccione el empleado al que pertenece el certificado.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cert-create-curso"]',
    content: "Seleccione el curso o capacitación realizada.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cert-create-archivo"]',
    content:
      "Arrastre o seleccione el archivo del certificado (PDF, JPG, PNG, máx 10MB).",
    position: "bottom",
  },
  {
    selector: '[data-tour="cert-create-submit"]',
    content: "Revise y presione para guardar el certificado.",
    position: "top",
  },
];
