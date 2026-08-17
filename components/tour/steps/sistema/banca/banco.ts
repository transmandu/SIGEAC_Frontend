import { StepType } from "@reactour/tour";

export const bancosSteps: StepType[] = [
  {
    selector: '[data-tour="bancos-title"]',
    content:
      "Gestione los bancos registrados en el sistema. Cada banco puede ser Nacional o Extranjero.",
    position: "center",
  },
  {
    selector: '[data-tour="bancos-table"]',
    content:
      "Cada fila muestra el nombre del banco (haga clic para ver sus cuentas) y el tipo. Use las acciones disponibles para editar o eliminar.",
    position: "top",
  },
  {
    selector: '[data-tour="bancos-new"]',
    content:
      "Registre un nuevo banco. Solo necesita ingresar el nombre y seleccionar el tipo.",
    position: "left",
  },
  {
    selector: '[data-tour="bancos-actions"]',
    content:
      "Acciones por banco: editar los datos o eliminar el registro del sistema.",
    position: "left",
  },
  {
    selector: '[data-tour="bancos-pagination"]',
    content:
      "Navegue entre las páginas de resultados usando los controles de paginación.",
    position: "bottom",
  },
];
