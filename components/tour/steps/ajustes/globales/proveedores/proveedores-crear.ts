import { StepType } from "@reactour/tour";

export const proveedoresCrearSteps: StepType[] = [
  {
    selector: '[data-tour="proveedores-dialog-header"]',
    content:
      "Complete el formulario para registrar un nuevo proveedor o beneficiario en el sistema.",
    position: "center",
  },
  {
    selector: '[data-tour="proveedores-dialog-name"]',
    content:
      "Ingrese el nombre del proveedor o beneficiario. Este campo es obligatorio.",
    position: "bottom",
  },
  {
    selector: '[data-tour="proveedores-dialog-phone"]',
    content:
      "Registre el teléfono de contacto. Incluya el código de país (ej: +584247000001).",
    position: "bottom",
  },
  {
    selector: '[data-tour="proveedores-dialog-email"]',
    content:
      "Correo electrónico del proveedor. Debe ser una dirección de correo válida.",
    position: "bottom",
  },
  {
    selector: '[data-tour="proveedores-dialog-address"]',
    content:
      "Dirección fiscal del proveedor para facturación y correspondencia.",
    position: "bottom",
  },
  {
    selector: '[data-tour="proveedores-dialog-type"]',
    content:
      "Seleccione el tipo: Proveedor para compras regulares, o Beneficiario para pagos sin orden de compra.",
    position: "top",
  },
  {
    selector: '[data-tour="proveedores-dialog-submit"]',
    content:
      "Presione para guardar el nuevo proveedor. Todos los campos son obligatorios.",
    position: "top",
  },
];
