import { StepType } from "@reactour/tour";

export const tercerosSteps: StepType[] = [
  {
    selector: '[data-tour="terceros-title"]',
    content:
      "Gestione los terceros registrados en el sistema. Cada tercero puede ser una empresa o una persona.",
    position: "center",
  },
  {
    selector: '[data-tour="terceros-table"]',
    content:
      "Cada fila muestra el nombre del tercero y su tipo (Empresa, Persona u Otro). Use las acciones disponibles para editar o eliminar.",
    position: "top",
  },
  {
    selector: '[data-tour="terceros-new"]',
    content:
      "Registre un nuevo tercero. Solo necesita ingresar el nombre y seleccionar el tipo.",
    position: "left",
  },
  {
    selector: '[data-tour="terceros-actions"]',
    content:
      "Acciones por tercero: editar los datos o eliminar el registro del sistema.",
    position: "left",
  },
  {
    selector: '[data-tour="terceros-pagination"]',
    content:
      "Navegue entre las páginas de resultados usando los controles de paginación.",
    position: "bottom",
  },
];
