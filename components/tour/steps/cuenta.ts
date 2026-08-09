import { StepType } from "@reactour/tour";

export const cuentaSteps: StepType[] = [
  {
    selector: '[data-tour="cuenta-user-card"]',
    content:
      "Su perfil: foto, nombre y el rol que ejerce. El rol de empresa corresponde a la empresa que tenga seleccionada.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cuenta-company-info"]',
    content:
      "Las empresas a las que tiene acceso, con el rol que posee en cada una. La marcada como activa es la que está usando.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cuenta-security"]',
    content:
      "La contraseña la asigna un administrador. Desde aquí puede solicitar el cambio y se le notificará.",
    position: "top",
  },
];
