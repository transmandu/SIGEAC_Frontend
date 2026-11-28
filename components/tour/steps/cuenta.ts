import { StepType } from "@reactour/tour";

export const cuentaSteps: StepType[] = [
  {
    selector: '[data-tour="cuenta-user-card"]',
    content:
      "Su perfil: foto, nombre, cargo y los roles que ejerce. El rol de empresa corresponde a la empresa que tenga seleccionada.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cuenta-company-info"]',
    content:
      "Las empresas a las que tiene acceso, con el rol que posee en cada una. La marcada como activa es la que está usando.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cuenta-account"]',
    content:
      "Los datos de su cuenta: nombre de usuario, correo electrónico y la empresa activa.",
    position: "top",
  },
  {
    selector: '[data-tour="cuenta-employee"]',
    content:
      "Su ficha laboral en la empresa activa: nombre, cargo, departamento y documento. Si no aparece, su usuario aún no está asociado a un empleado en esa empresa.",
    position: "top",
  },
  {
    selector: '[data-tour="cuenta-security"]',
    content:
      "La nueva contraseña la asigna un administrador. Con «Solicitar cambio» se le avisa para que se la comunique.",
    position: "top",
  },
];
