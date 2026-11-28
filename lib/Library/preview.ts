/**
 * El visor de la biblioteca solo sabe mostrar PDF. La biblioteca también guarda
 * Excel, que se descarga pero no se previsualiza: mandarlo al visor terminaba en
 * «No se pudo leer el documento».
 */
const NO_PREVIEW_EXTENSIONS = ["xls", "xlsx"];

export const NO_PREVIEW_MESSAGE =
  "Los archivos de Excel no tienen vista previa. Descárgalo para abrirlo.";

export const extensionOf = (path?: string | null): string =>
  String(path ?? "")
    .split(".")
    .pop()
    ?.toLowerCase() ?? "";

export const hasNoPreview = (extension?: string | null): boolean =>
  NO_PREVIEW_EXTENSIONS.includes(String(extension ?? "").toLowerCase());
