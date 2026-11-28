import { StepType } from "@reactour/tour";

export const clientesSteps: StepType[] = [
  {
    selector: '[data-tour="clientes-title"]',
    content:
      "Gestione los clientes registrados en el sistema. Cada cliente tiene un documento de identidad, nombre, teléfono y dirección.",
    position: "center",
  },
  {
    selector: '[data-tour="clientes-toolbar"]',
    content:
      "Busque clientes por nombre, documento (RIF / C.I.), teléfono o ubicación.",
    position: "top",
  },
  {
    selector: '[data-tour="clientes-table"]',
    content:
      "Cada fila muestra el nombre del cliente, su RIF / C.I., teléfono y ubicación, y además su tipo (Propietario o Explotador) o sus días de crédito, según la empresa.",
    position: "top",
  },
  {
    selector: '[data-tour="clientes-new"]',
    content:
      "Registre un nuevo cliente. En una empresa aeronáutica solo el nombre y el tipo son obligatorios; en una aerolínea se piden también el documento, el contacto y los días de crédito.",
    position: "left",
  },
  {
    selector: '[data-tour="clientes-actions"]',
    content:
      "Acciones por cliente: ver su detalle, editar sus datos o eliminarlo.",
    position: "left",
  },
  {
    selector: '[data-tour="clientes-pagination"]',
    content:
      "Navegue entre las páginas de resultados usando los controles de paginación.",
    position: "bottom",
  },
];
