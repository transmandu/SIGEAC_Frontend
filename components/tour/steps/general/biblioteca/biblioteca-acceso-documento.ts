import { StepType } from "@reactour/tour";

export const bibliotecaAccesoDocumentoSteps: StepType[] = [
  {
    selector: '[data-tour="biblioteca-doc-access-title"]',
    content:
      "Aquí decide quién ve este documento, aparte de quién ve su carpeta.",
    position: "center",
  },
  {
    selector: '[data-tour="biblioteca-doc-access-switch"]',
    content:
      "Apagado: el documento lo ve quien tenga acceso a su carpeta. Encendido: solo las personas que elija y la dirección del departamento, sin importar la carpeta.",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-doc-access-members"]',
    content:
      "Elija las personas con acceso (de cualquier departamento). Sirve para dejar fuera a alguien que ve la carpeta, o para dar este documento a alguien que no la ve: en ese caso solo verá este documento. Vale también para sus réplicas.",
    position: "top",
  },
  {
    selector: '[data-tour="biblioteca-doc-access-save"]',
    content: "Guarde los cambios.",
    position: "top",
  },
];
