import { StepType } from "@reactour/tour";

export const cargoGuiaListaSteps: StepType[] = [
  {
    selector: '[data-tour="cargo-guia-title"]',
    content:
      "Listado de guías de carga registradas para esta aeronave en el período seleccionado.",
    position: "center",
  },
  {
    selector: '[data-tour="cargo-guia-btn-volver"]',
    content: "Volver al dashboard de Carga para seleccionar otra aeronave.",
    position: "right",
  },
  {
    selector: '[data-tour="cargo-guia-periodo"]',
    content: "Filtrar las guías por mes y año para ver registros de períodos anteriores.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cargo-guia-btn-nuevo"]',
    content: "Registrar una nueva guía de carga para esta aeronave.",
    position: "left",
  },
  {
    selector: '[data-tour="cargo-guia-btn-exportar"]',
    content: "Exportar las guías de esta aeronave a Excel para su análisis externo.",
    position: "left",
  },
  {
    selector: '[data-tour="cargo-guia-tabla"]',
    content:
      "Tabla con todas las guías registradas. Cada fila muestra N° de guía, fecha, cliente, transportista, estado, y acciones disponibles.",
    position: "top",
  },
];
