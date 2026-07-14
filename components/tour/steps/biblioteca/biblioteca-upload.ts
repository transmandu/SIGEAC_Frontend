import { StepType } from "@reactour/tour";

export const bibliotecaUploadSteps: StepType[] = [
  {
    selector: '[data-tour="biblioteca-upload-title"]',
    content: "Complete el formulario para registrar un nuevo documento en la biblioteca.",
    position: "center",
  },
  {
    selector: '[data-tour="biblioteca-upload-name"]',
    content: "Ingrese el nombre del documento. Debe ser descriptivo y único.",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-upload-version"]',
    content: "Etiqueta de versión. Opcional, puede asignar un identificador personalizado a la versión que está subiendo.",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-upload-depto"]',
    content: "Seleccione el departamento al que pertenece el documento.",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-upload-categoria"]',
    content: "Seleccione la categoría del documento. Puede agregar una nueva si es necesario.",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-upload-vigencia"]',
    content: "Defina si el documento tiene fecha de vencimiento o es permanente.",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-upload-dropzone"]',
    content: "Arrastre o haga clic para seleccionar el archivo PDF. Solo se aceptan archivos PDF.",
    position: "top",
  },
  {
    selector: '[data-tour="biblioteca-upload-save"]',
    content: "Guarde el documento.  ",
    position: "top",
  },
];