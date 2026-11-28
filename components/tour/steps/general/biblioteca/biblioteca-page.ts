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
      "Busque por el nombre del documento. La búsqueda recorre todo el departamento, no solo la carpeta abierta, y cada resultado indica en qué carpeta está. Pulse «/» para llegar aquí desde el teclado.",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-filter-btn"]',
    content:
      "Filtros y orden: categoría, estado (Vigente, Vencido o Permanente) y el orden de la lista. El número indica cuántos están activos.",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-vista-toggle"]',
    content:
      "Cambie entre la lista y la cuadrícula con miniaturas de la primera página. La biblioteca recuerda su elección.",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-historial-btn"]',
    content:
      "Historial de trazabilidad: registro cronológico de los enlaces compartidos y sus accesos.",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-solicitudes-btn"]',
    content:
      "Solicitudes de enlace enviadas por los directores. Aquí el Director DIP las aprueba o rechaza; el número marca las pendientes.",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-dashboard-btn"]',
    content:
      "Panel de estadísticas: distribución documental, estado de las solicitudes, accesos externos y métricas clave.",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-papelera-btn"]',
    content:
      "Papelera. Lo que elimine de la biblioteca se aparta aquí durante 30 días: puede restaurarlo o eliminarlo definitivamente.",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-subir-btn"]',
    content:
      "Suba un documento (PDF o Excel, hasta 10 MB). También puede arrastrar el archivo desde su escritorio sobre la carpeta abierta.",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-carpetas-movil-btn"]',
    content:
      "En pantallas pequeñas las carpetas, los favoritos y los recientes están en este botón: ábralo para navegar.",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-accesos-rapidos"]',
    content:
      "Accesos rápidos, solo suyos: sus favoritos (la estrella de cada documento) y lo último que abrió, de todos los departamentos que ve.",
    position: "right",
  },
  {
    selector: '[data-tour="biblioteca-carpetas-header"]',
    content:
      "Panel de carpetas organizadas por departamento. Seleccione una carpeta para ver sus documentos; el candado marca las de acceso restringido.",
    position: "right",
  },
  {
    selector: '[data-tour="biblioteca-dept-row"]',
    content:
      "Cada departamento tiene su propia estructura de carpetas. Haga clic para expandir y navegar. Con clic derecho en una carpeta puede renombrarla, gestionar sus accesos o compartirla.",
    position: "right",
  },
  {
    selector: '[data-tour="biblioteca-nueva-carpeta-btn"]',
    content:
      "Cree carpetas para organizar los documentos. Puede restringir una carpeta a personas concretas.",
    position: "right",
  },
  {
    selector: '[data-tour="biblioteca-documentos-header"]',
    content:
      "Aquí se muestran las subcarpetas y los documentos de la carpeta abierta. Clic derecho sobre un documento o carpeta abre su menú; arrastre documentos a una carpeta para moverlos y use «Copiar a…» para dejar una réplica en otra. Con el teclado: flechas para moverse, Enter para abrir, Espacio para marcar, F2 para renombrar y Supr para eliminar.",
    position: "top",
  },
];
