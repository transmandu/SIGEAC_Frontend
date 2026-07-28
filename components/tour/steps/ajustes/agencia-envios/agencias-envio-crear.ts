import { StepType } from "@reactour/tour";

export const agenciasEnvioCrearSteps: StepType[] = [
  {
    selector: '[data-tour="agencias-envio-crear-header"]',
    content:
      "Complete el formulario para registrar una nueva agencia de envío. Los campos marcados son obligatorios.",
    position: "center",
  },
  {
    selector: '[data-tour="agencias-envio-crear-name"]',
    content:
      "Nombre comercial de la agencia de envío. Ej: DHL Express, Zoom, MRW.",
    position: "bottom",
  },
  {
    selector: '[data-tour="agencias-envio-crear-code"]',
    content: "Código identificador único para la agencia. Ej: DHL001, ZOOM01.",
    position: "bottom",
  },
  {
    selector: '[data-tour="agencias-envio-crear-description"]',
    content:
      "Descripción breve de la agencia (opcional). Indique servicios o información relevante.",
    position: "bottom",
  },
  {
    selector: '[data-tour="agencias-envio-crear-type"]',
    content:
      "Tipo de agencia: Nacional (envíos dentro del país) o Internacional (envíos al exterior).",
    position: "top",
  },
  {
    selector: '[data-tour="agencias-envio-crear-phone"]',
    content: "Teléfono de contacto de la agencia (opcional).",
    position: "bottom",
  },
  {
    selector: '[data-tour="agencias-envio-crear-email"]',
    content: "Correo electrónico de contacto (opcional).",
    position: "bottom",
  },
  {
    selector: '[data-tour="agencias-envio-crear-submit"]',
    content:
      "Presione para guardar la nueva agencia. Verifique que los datos sean correctos antes de enviar.",
    position: "top",
  },
];
