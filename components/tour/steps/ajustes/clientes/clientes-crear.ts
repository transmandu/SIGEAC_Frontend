import { StepType } from "@reactour/tour";

export const clientesCrearSteps: StepType[] = [
  {
    selector: '[data-tour="clientes-crear-header"]',
    content:
      "Complete el formulario para registrar un nuevo cliente en el sistema. Todos los campos marcados con * son obligatorios.",
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
      "Nombre completo del cliente. Máximo 40 caracteres, solo letras y números.",
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
    content:
      "Dirección fiscal del cliente (opcional). Máximo 100 caracteres.",
    position: "bottom",
  },
  {
    selector: '[data-tour="clientes-crear-authorizing"]',
    content:
      "Tipo de cliente: Propietario (dueño de la aeronave) o Explotador (quien opera la aeronave).",
    position: "top",
  },
  {
    selector: '[data-tour="clientes-crear-submit"]',
    content:
      "Presione para guardar el nuevo cliente. Verifique que los datos ingresados sean correctos antes de enviar.",
    position: "top",
  },
];
