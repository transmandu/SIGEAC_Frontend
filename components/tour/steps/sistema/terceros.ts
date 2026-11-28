import { StepType } from "@reactour/tour";

export const tercerosSteps: StepType[] = [
  {
    selector: '[data-tour="terceros-title"]',
    content: "Terceros registrados en el sistema: empresas, personas u otros.",
    position: "center",
  },
  {
    selector: '[data-tour="terceros-toolbar"]',
    content:
      "Busque terceros por nombre o tipo, y filtre por tipo (Empresa, Persona u Otro).",
    position: "top",
  },
  {
    selector: '[data-tour="terceros-new"]',
    content: "Registre un tercero: nombre y tipo.",
    position: "left",
  },
  {
    selector: '[data-tour="terceros-table"]',
    content: "Cada fila muestra el nombre del tercero y su tipo.",
    position: "top",
  },
  {
    selector: '[data-tour="terceros-actions"]',
    content:
      "Edite los datos del tercero o elimínelo. La eliminación pide confirmación.",
    position: "left",
  },
  {
    selector: '[data-tour="terceros-pagination"]',
    content: "Navegue entre las páginas de resultados.",
    position: "bottom",
  },
];
