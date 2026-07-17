import { StepType } from "@reactour/tour";

export const qrSteps: StepType[] = [
  {
    selector: '[data-tour="qr-header"]',
    content:
      "Genere códigos QR para acceso público al módulo SMS. Escanéelos para abrir el formulario de reporte o la página de SMS.",
    position: "center",
  },
  {
    selector: '[data-tour="qr-reportes"]',
    content: "QR que enlaza al formulario de creación de reportes SMS.",
    position: "bottom",
  },
  {
    selector: '[data-tour="qr-reportes-link"]',
    content: "Enlace público al formulario de reportes. Haga clic para abrirlo",
    position: "bottom",
  },
  {
    selector: '[data-tour="qr-reportes-download"]',
    content:
      "Descargue este código QR como imagen para imprimirlo o compartirlo físicamente.",
    position: "bottom",
  },
  {
    selector: '[data-tour="qr-pagina-sms"]',
    content:
      "QR que enlaza a la página principal de SMS. Útil para acceso rápido del personal autorizado.",
    position: "bottom",
  },
  {
    selector: '[data-tour="qr-pagina-sms-link"]',
    content:
      "Enlace público a la página de SMS. Haga clic para acceder directamente.",
    position: "bottom",
  },
  {
    selector: '[data-tour="qr-pagina-sms-download"]',
    content:
      "Descargue este código QR como imagen para imprimirlo o compartirlo físicamente.",
    position: "bottom",
  },
];
