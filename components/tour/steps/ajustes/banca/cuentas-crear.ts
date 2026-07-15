import { StepType } from "@reactour/tour";

export const cuentasCrearSteps: StepType[] = [
  {
    selector: '[data-tour="cuentas-crear-header"]',
    content:
      "Complete el formulario para registrar una nueva cuenta bancaria. Todos los campos marcados son obligatorios.",
    position: "center",
  },
  {
    selector: '[data-tour="cuentas-crear-name"]',
    content:
      "Nombre identificativo de la cuenta bancaria. Ej: Cuenta Principal Banesco.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cuentas-crear-bank"]',
    content:
      "Seleccione el banco al que pertenece esta cuenta de la lista de bancos registrados.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cuentas-crear-account-number"]',
    content: "Número de cuenta bancaria completo. Debe ser un número válido.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cuentas-crear-account-type"]',
    content:
      "Tipo de cuenta: Corriente (operaciones diarias) o Ahorro (ahorros).",
    position: "bottom",
  },
  {
    selector: '[data-tour="cuentas-crear-account-owner"]',
    content: "Tipo de titular: Natural (persona) o Jurídica (empresa).",
    position: "bottom",
  },
  {
    selector: '[data-tour="cuentas-crear-payment-methods"]',
    content:
      "Seleccione los métodos de pago habilitados para esta cuenta. Puede elegir uno o varios.",
    position: "top",
  },
  {
    selector: '[data-tour="cuentas-crear-companies"]',
    content:
      "Seleccione las compañías que tendrán acceso a esta cuenta bancaria.",
    position: "top",
  },
  {
    selector: '[data-tour="cuentas-crear-submit"]',
    content:
      "Presione para guardar la nueva cuenta bancaria. Verifique que los datos sean correctos antes de enviar.",
    position: "top",
  },
];
