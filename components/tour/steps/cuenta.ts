import { StepType } from "@reactour/tour";

export const cuentaSteps: StepType[] = [
  {
    selector: '[data-tour="cuenta-title"]',
    content:
      "Panel de configuración de su cuenta personal. Aquí puede ver su información, los datos de la empresa y gestionar sus roles de acceso.",
    position: "center",
  },
  {
    selector: '[data-tour="cuenta-user-card"]',
    content:
      "Resumen visual de su perfil: avatar, nombre completo, roles asignados y acceso a editar su información personal.",
    position: "right",
  },
  {
    selector: '[data-tour="cuenta-tabs"]',
    content:
      "Navegue entre las secciones de Información personal, datos de la empresa y roles del sistema.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cuenta-user-info"]',
    content:
      "Información básica de su cuenta: nombre completo, nombre de usuario, correo electrónico y estado (activo/inactivo).",
    position: "bottom",
  },
  {
    selector: '[data-tour="cuenta-company-info"]',
    content:
      "Datos generales de la empresa Transmandu C.A: RIF, teléfono, correo y dirección.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cuenta-roles"]',
    content:
      "Gestión de roles: vea sus roles globales y asigne roles específicos por empresa. Solo disponible para SUPERUSER.",
    position: "bottom",
  },
];
