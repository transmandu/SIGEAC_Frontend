import { StepType } from "@reactour/tour";

export const bibliotecaUploadSteps: StepType[] = [
  {
    selector: '[data-tour="biblioteca-upload-title"]',
    content:
      "Complete el formulario para registrar un nuevo documento en la biblioteca. El archivo queda como su primera versión.",
    position: "center",
  },
  {
    selector: '[data-tour="biblioteca-upload-dropzone"]',
    content:
      "Seleccione el archivo o arrástrelo aquí. Se aceptan PDF y Excel de hasta 10 MB.",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-upload-name"]',
    content: "Ingrese el nombre del documento. Debe ser descriptivo y único.",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-upload-version"]',
    content:
      "Etiqueta de versión. Opcional: un identificador propio para esta versión (por ejemplo, «Rev A»).",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-upload-depto"]',
    content: "Departamento al que pertenece el documento.",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-upload-categoria"]',
    content:
      "Categoría del documento. Si no existe, use «Nueva categoría» al final de la lista.",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-upload-carpeta"]',
    content: "Carpeta de destino. Por defecto es la carpeta que tenía abierta.",
    position: "bottom",
  },
  {
    selector: '[data-tour="biblioteca-upload-vigencia"]',
    content:
      "Active «Tiene vencimiento» si el documento caduca y elija la fecha; si no, queda como permanente.",
    position: "top",
  },
  {
    selector: '[data-tour="biblioteca-upload-save"]',
    content: "Guarde el documento.",
    position: "top",
  },
];
