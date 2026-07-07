import { StepType } from "@reactour/tour";

export const cargoGuiaCrearSteps: StepType[] = [
  {
    selector: '[data-tour="cargo-crear-title"]',
    content:
      "Complete el formulario para registrar una nueva guía de carga.",
    position: "center",
  },
  {
    selector: '[data-tour="cargo-crear-aeronave"]',
    content:
      "Seleccione la aeronave a la que pertenece la carga. Puede ser de la empresa o externa (terceros).",
    position: "bottom",
  },
  {
    selector: '[data-tour="cargo-crear-fecha"]',
    content:
      "Fecha de registro de la guía. Solo se puede registrar dentro del período actual.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cargo-crear-transportista"]',
    content:
      "Seleccione el transportista que llevará la carga. Si no existe, puede registrar uno mediante el botón 'Registrar nuevo transportista'.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cargo-crear-piloto"]',
    content:
      "Seleccione el piloto del vuelo. Se muestran pilotos internos y externos filtrados por rango Capitán.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cargo-crear-guia-numero"]',
    content: "Número de guía auto-generado por el sistema. No editable.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cargo-crear-cliente"]',
    content:
      "Seleccione el cliente o remitente de la carga. Puede registrar uno nuevo si no existe.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cargo-crear-emisor"]',
    content:
      "Emisor de la guía asignado automáticamente desde el usuario actual.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cargo-crear-copiloto"]',
    content:
      "Seleccione el copiloto del vuelo. Filtrado por rango Primer Oficial.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cargo-crear-items-header"]',
    content:
      "Sección de productos. Aquí puede agregar todos los ítems que componen la carga.",
    position: "top",
  },
  {
    selector: '[data-tour="cargo-crear-items-usar-balanza"]',
    content:
      "En caso de contar con balanza electrónica, puede usar esta opción para capturar el peso automáticamente.",
    position: "left",
  },
  {
    selector: '[data-tour="cargo-crear-items-agregar"]',
    content:
      "Agregue una nueva fila de producto con valores por defecto editables.",
    position: "left",
  },
  {
    selector: '[data-tour="cargo-crear-items-producto"]',
    content:
      "Nombre del producto con autocompletado basado en registros anteriores.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cargo-crear-items-unidades"]',
    content: "Cantidad de unidades del producto.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cargo-crear-items-peso"]',
    content:
      "Peso del producto en kilogramos. Puede ser ingresado manualmente o capturado desde la balanza.",
    position: "bottom",
  },
  {
    selector: '[data-tour="cargo-crear-items-eliminar"]',
    content:
      "Elimina la fila del producto. No es posible eliminar la única fila restante.",
    position: "left",
  },
  {
    selector: '[data-tour="cargo-crear-items-total"]',
    content:
      "Totales acumulados de unidades y peso de todos los productos.",
    position: "top",
  },
  {
    selector: '[data-tour="cargo-crear-submit"]',
    content:
      "Guarda la guía de carga y regresa al listado de aeronaves.",
    position: "top",
  },
];