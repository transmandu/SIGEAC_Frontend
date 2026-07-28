import { StepType } from "@reactour/tour";

export const tarjetasSteps: StepType[] = [
  {
    selector: '[data-tour="tarjetas-title"]',
    content:
      "Gestione las tarjetas registradas en el sistema. Cada tarjeta está asociada a una cuenta bancaria y un método de pago.",
    position: "center",
  },
  {
    selector: '[data-tour="tarjetas-table"]',
    content:
      "Cada fila muestra el nombre, número de tarjeta, método de pago, banco/cuenta asociada y compañías habilitadas.",
    position: "top",
  },
  {
    selector: '[data-tour="tarjetas-new"]',
    content:
      "Registre una nueva tarjeta. Debe asociarla a una cuenta bancaria y seleccionar el método de pago.",
    position: "left",
  },
  {
    selector: '[data-tour="tarjetas-actions"]',
    content:
      "Acciones por tarjeta: editar los datos o eliminar la tarjeta del sistema.",
    position: "left",
  },
  {
    selector: '[data-tour="tarjetas-pagination"]',
    content:
      "Navegue entre las páginas de resultados usando los controles de paginación.",
    position: "bottom",
  },
];
