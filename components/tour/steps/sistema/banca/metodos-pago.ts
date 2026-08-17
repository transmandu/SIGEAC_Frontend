import { StepType } from "@reactour/tour";

export const metodosPagoSteps: StepType[] = [
  {
    selector: '[data-tour="metodos-pago-title"]',
    content:
      "Catálogo de métodos de pago disponibles en el sistema. Es una lista de solo lectura definida por el sistema.",
    position: "center",
  },
  {
    selector: '[data-tour="metodos-pago-table"]',
    content:
      "Cada fila muestra el nombre del método de pago, las cuentas bancarias que lo tienen habilitado y la fecha de creación.",
    position: "top",
  },
  {
    selector: '[data-tour="metodos-pago-pagination"]',
    content:
      "Navegue entre las páginas de resultados usando los controles de paginación.",
    position: "bottom",
  },
];
