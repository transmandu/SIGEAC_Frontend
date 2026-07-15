import { StepType } from "@reactour/tour";

export const clientesDetalleSteps: StepType[] = [
  {
    selector: '[data-tour="clientes-detalle-title"]',
    content:
      "Resumen de vuelos y finanzas del cliente. Aquí podrá ver estadísticas detalladas y las deudas pendientes.",
    position: "center",
  },
  {
    selector: '[data-tour="clientes-detalle-stats"]',
    content:
      "Indicadores clave del cliente: monto pagado en el año, deuda acumulada, número de vuelos realizados y costos totales.",
    position: "bottom",
  },
  {
    selector: '[data-tour="clientes-detalle-chart"]',
    content:
      "Gráfico de barras con la distribución mensual de montos pagados y costos. Seleccione un año y haga clic en un mes para ver el detalle de los vuelos.",
    position: "top",
  },
  {
    selector: '[data-tour="clientes-detalle-tabs"]',
    content:
      "Cambie entre la vista de Estadísticas y la vista de Deudas para revisar los pagos pendientes del cliente.",
    position: "bottom",
  },
  {
    selector: '[data-tour="clientes-detalle-debts-stats"]',
    content:
      "Resumen de deudas del cliente: deuda total acumulada, cantidad de vuelos con deuda y deuda promedio por vuelo.",
    position: "bottom",
  },
];
