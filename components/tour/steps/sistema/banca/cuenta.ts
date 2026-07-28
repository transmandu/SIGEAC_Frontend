import { StepType } from "@reactour/tour";

export const cuentasSteps: StepType[] = [
  {
    selector: '[data-tour="cuentas-title"]',
    content:
      "Gestione las cuentas bancarias registradas en el sistema. Cada cuenta está asociada a un banco y puede tener múltiples métodos de pago y compañías habilitadas.",
    position: "center",
  },
  {
    selector: '[data-tour="cuentas-table"]',
    content:
      "Cada fila muestra el nombre, número de cuenta, banco, tipo de titular, tipo de cuenta, métodos de pago y compañías habilitadas. Haga clic en el nombre para ver el detalle.",
    position: "top",
  },
  {
    selector: '[data-tour="cuentas-new"]',
    content:
      "Registre una nueva cuenta bancaria. Debe completar nombre, banco, número de cuenta, tipo y asignar métodos de pago y compañías.",
    position: "left",
  },
  {
    selector: '[data-tour="cuentas-actions"]',
    content:
      "Acciones por cuenta: editar los datos o eliminar la cuenta del sistema.",
    position: "left",
  },
  {
    selector: '[data-tour="cuentas-pagination"]',
    content:
      "Navegue entre las páginas de resultados usando los controles de paginación.",
    position: "bottom",
  },
];
