import { StepType } from "@reactour/tour";

export const agenciasEnvioSteps: StepType[] = [
  {
    selector: '[data-tour="agencias-envio-title"]',
    content:
      "Gestione las agencias de envío registradas en el sistema. Cada agencia puede ser nacional o internacional y tiene datos de contacto asociados.",
    position: "center",
  },
  {
    selector: '[data-tour="agencias-envio-toolbar"]',
    content:
      "Busque agencias por nombre, código o datos de contacto. También puede filtrar por tipo: Nacional o Internacional.",
    position: "top",
  },
  {
    selector: '[data-tour="agencias-envio-new"]',
    content:
      "Registre una nueva agencia de envío. Debe completar nombre, código, tipo y datos de contacto.",
    position: "left",
  },
  {
    selector: '[data-tour="agencias-envio-table"]',
    content:
      "Cada fila muestra el nombre, código, descripción y tipo de la agencia. Haga clic en la flecha para expandir y ver los datos de contacto.",
    position: "top",
  },
  {
    selector: '[data-tour="agencias-envio-actions"]',
    content:
      "Acciones por agencia: editar los datos o eliminar la agencia del sistema.",
    position: "left",
  },
  {
    selector: '[data-tour="agencias-envio-pagination"]',
    content:
      "Navegue entre las páginas de resultados usando los controles de paginación.",
    position: "bottom",
  },
];
