import { StepType } from "@reactour/tour";

export const agenciasEnvioSteps: StepType[] = [
  {
    selector: '[data-tour="agencias-envio-title"]',
    content:
      "Agentes de envío registrados en el sistema. Cada uno puede ser nacional o internacional y tiene datos de contacto asociados.",
    position: "center",
  },
  {
    selector: '[data-tour="agencias-envio-toolbar"]',
    content:
      "Busque por nombre, código, descripción, teléfono o correo. También puede filtrar por tipo: Nacional o Internacional.",
    position: "top",
  },
  {
    selector: '[data-tour="agencias-envio-new"]',
    content:
      "Registre un agente de envío: nombre, código, tipo y, si quiere, descripción y datos de contacto.",
    position: "left",
  },
  {
    selector: '[data-tour="agencias-envio-table"]',
    content:
      "Cada fila muestra el nombre, código, descripción y tipo. Haga clic en la fila (o en su flecha) para expandirla y ver los datos de contacto.",
    position: "top",
  },
  {
    selector: '[data-tour="agencias-envio-actions"]',
    content: "Acciones por agente: editar sus datos o eliminarlo del sistema.",
    position: "left",
  },
  {
    selector: '[data-tour="agencias-envio-pagination"]',
    content:
      "Navegue entre las páginas de resultados usando los controles de paginación.",
    position: "bottom",
  },
];
