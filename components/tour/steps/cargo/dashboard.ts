import { StepType } from "@reactour/tour";

export const cargoDashboardSteps: StepType[] = [
    {
    selector: '[data-tour="cargo-dashboard-title"]',
    content:
      "Bienvenido al Módulo de Carga. Aquí se gestionan las guías de carga y manifiestos de despacho por aeronave.",
    position: "center",
  },
  {
    selector: '[data-tour="cargo-dashboard-periodo"]',
    content:
      "Filtra el período de análisis. Puede seleccionar un mes especifico y año para visualizar las guias de carga de ese periodo.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cargo-dashboard-btn-nuevo"]',
    content:
      "Crea una nueva guía de carga para cualquier aeronave. El botón cambia según el tab activo (Empresa / Externa).",
    position: "left",
  },
  {
    selector: '[data-tour="cargo-dashboard-btn-exportar"]',
    content:
      "Exporta todas las guías de carga del período actual a un archivo Excel.",
    position: "left",
  },
  {
    selector: '[data-tour="cargo-dashboard-tab-registered"]',
    content:
      "Muestra las aeronaves registradas de la empresa con su conteo de guías.",
    position: "top",
  },
  {
    selector: '[data-tour="cargo-dashboard-tab-external"]',
    content:
      "Muestra las aeronaves externas (de terceros) registradas en el período.",
    position: "top",
  },
  {
    selector: '[data-tour="cargo-dashboard-card"]',
    content:
      "Cada card muestra una aeronave con el total de guías registradas. Haz clic en 'Ver Registros de Carga' para acceder a sus guías.",
    position: "top",
  },

];