import { StepType } from "@reactour/tour";

export const bibliotecaPageSteps: StepType[] = [
  {
    selector: '[data-tour="biblioteca-title"]',
    content:
      "Bienvenido a la Biblioteca Digital. Aquí se gestionan documentos técnicos, manuales y certificados de la empresa.",
    position: "center",
  },
  {
    selector: '[data-tour="biblioteca-search-input"]',
    content:
      "Barra de búsqueda. Escriba el nombre del documento para filtrar los resultados en tiempo real.",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-filter-btn"]',
    content:
      "Filtros avanzados. Permite filtrar documentos por categoría y estado (Vigente, Vencido, No Aplica).",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-carpetas-header"]',
    content:
      "Panel de carpetas organizadas por departamento. Seleccione una carpeta para ver sus documentos.",
    position: "right",
  },
  {
    selector: '[data-tour="biblioteca-dept-row"]',
    content:
      "Cada departamento tiene su propia estructura de carpetas. Haga clic para expandir y navegar.",
    position: "right",
  },
  {
    selector: '[data-tour="biblioteca-nueva-carpeta-btn"]',
    content:
      "Cree nuevas carpetas para organizar los documentos por categoría o área.",
    position: "right",
  },
  {
    selector: '[data-tour="biblioteca-documentos-header"]',
    content:
      "Aquí se listan los documentos de la carpeta seleccionada. Cada fila muestra título, versión, tipo, vigencia y acciones disponibles.",
    position: "top",
  },
  {
    selector: '[data-tour="biblioteca-subir-btn"]',
    content:
      "Suba un nuevo documento al sistema. Complete el formulario con nombre, categoría, departamento y archivo PDF.",
    position: "left",
  },
  {
    selector: '[data-tour="biblioteca-historial-btn"]',
    content:
      "Historial de trazabilidad. Muestra un registro cronológico de todos los accesos y descargas realizadas.",
    position: "left",
  },
  {
    selector: '[data-tour="biblioteca-solicitudes-btn"]',
    content:
      "Gestiona las solicitudes de acceso a documentos enviadas por usuarios externos. Puede aprobar o rechazar.",
    position: "left",
  },
  {
    selector: '[data-tour="biblioteca-dashboard-btn"]',
    content:
      "Panel de estadísticas con gráficos de distribución documental, estados, accesos externos y métricas clave.",
    position: "left",
  },
];
