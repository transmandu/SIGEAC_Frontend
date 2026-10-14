import { StepType } from "@reactour/tour";

const submitStep: StepType = {
  selector: '[data-tour="clientes-crear-submit"]',
  content:
    "Presione para guardar el nuevo cliente. Verifique que los datos ingresados sean correctos antes de enviar.",
  position: "top",
};

export const clientesCrearAeronauticalSteps: StepType[] = [
  {
    selector: '[data-tour="clientes-crear-header"]',
    content:
      "Registre un nuevo cliente. Solo el nombre y el tipo de cliente son obligatorios; el documento y los datos de contacto son opcionales.",
    position: "center",
  },
  {
    selector: '[data-tour="clientes-crear-dni-type"]',
    content:
      "Tipo de documento de identidad (opcional): V (Venezolano), J (Jurídico) o E (Extranjero). Si indica el tipo, debe indicar también el número.",
    position: "bottom",
  },
  {
    selector: '[data-tour="clientes-crear-dni"]',
    content:
      "Número de documento (RIF o Cédula), opcional. Solo números, entre 7 y 11 dígitos.",
    position: "bottom",
  },
  {
    selector: '[data-tour="clientes-crear-name"]',
    content:
      "Nombre o razón social del cliente. Mínimo 3 y máximo 40 caracteres: letras, números, espacios y . , & ' -",
    position: "bottom",
  },
  {
    selector: '[data-tour="clientes-crear-phone"]',
    content:
      "Teléfono de contacto (opcional). Debe tener entre 10 y 15 dígitos.",
    position: "bottom",
  },
  {
    selector: '[data-tour="clientes-crear-email"]',
    content:
      "Correo electrónico (opcional). Debe ser una dirección de correo válida.",
    position: "bottom",
  },
  {
    selector: '[data-tour="clientes-crear-address"]',
    content: "Dirección fiscal del cliente (opcional). Máximo 100 caracteres.",
    position: "bottom",
  },
  {
    selector: '[data-tour="clientes-crear-authorizing"]',
    content:
      "Tipo de cliente: Propietario (dueño de la aeronave) o Explotador (quien opera la aeronave).",
    position: "top",
  },
  submitStep,
];

export const clientesCrearAirlineSteps: StepType[] = [
  {
    selector: '[data-tour="clientes-crear-header"]',
    content:
      "Complete el formulario para registrar un nuevo cliente en el sistema. Todos los campos son obligatorios.",
    position: "center",
  },
  {
    selector: '[data-tour="clientes-crear-dni-type"]',
    content:
      "Seleccione el tipo de documento de identidad: V (Venezolano), J (Jurídico) o E (Extranjero).",
    position: "bottom",
  },
  {
    selector: '[data-tour="clientes-crear-dni"]',
    content:
      "Ingrese el número de documento de identidad (RIF o Cédula). Solo números, entre 7 y 11 dígitos.",
    position: "bottom",
  },
  {
    selector: '[data-tour="clientes-crear-name"]',
    content:
      "Nombre o razón social del cliente. Mínimo 3 y máximo 40 caracteres: letras, números, espacios y . , & ' -",
    position: "bottom",
  },
  {
    selector: '[data-tour="clientes-crear-phone"]',
    content: "Teléfono de contacto. Debe tener entre 10 y 15 dígitos.",
    position: "bottom",
  },
  {
    selector: '[data-tour="clientes-crear-email"]',
    content: "Correo electrónico. Debe ser una dirección de correo válida.",
    position: "bottom",
  },
  {
    selector: '[data-tour="clientes-crear-address"]',
    content: "Dirección fiscal del cliente. Máximo 100 caracteres.",
    position: "bottom",
  },
  {
    selector: '[data-tour="clientes-crear-credit"]',
    content:
      "Días de crédito que se le conceden al cliente para pagar (de 0 a 730).",
    position: "top",
  },
  submitStep,
];
