import { StepType } from "@reactour/tour";

export const clientesSteps: StepType[] = [
  {
    selector: '[data-tour="clientes-title"]',
    content:
      "Gestione los clientes registrados en el sistema. Cada cliente tiene un documento de identidad, nombre, teléfono y dirección.",
    position: "center",
  },
  {
    selector: '[data-tour="clientes-table"]',
    content:
      "Cada fila muestra el nombre del cliente, su RIF/C.I., número de teléfono y ubicación. Use las acciones disponibles para administrar cada cliente.",
    position: "top",
  },
  {
    selector: '[data-tour="clientes-new"]',
    content:
      "Registre un nuevo cliente. Debe completar tipo de documento, número de identificación, nombre y datos de contacto.",
    position: "left",
  },
  {
    selector: '[data-tour="clientes-actions"]',
    content:
      "Acciones por cliente: eliminar, ver resumen, estadísticas de vuelos, editar datos o agregar saldo a favor.",
    position: "left",
  },
  {
    selector: '[data-tour="clientes-pagination"]',
    content:
      "Navegue entre las páginas de resultados usando los controles de paginación.",
    position: "bottom",
  },
];
