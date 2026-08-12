/**
 * Los documentos de artículo aceptan pdf/jpg/jpeg/png (ver la validación de
 * storeDocument en el backend). El visor seguro monta PDFs por defecto, así
 * que hay que decirle explícitamente cuándo el adjunto es una imagen.
 */
const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png"];

export const isImageDocument = (filePath?: string | null): boolean => {
  if (!filePath) return false;
  const extension = filePath.split(".").pop()?.toLowerCase();
  return !!extension && IMAGE_EXTENSIONS.includes(extension);
};

/** Debe coincidir con `mimes:pdf,jpg,jpeg,png|max:10240` del backend. */
export const DOCUMENT_MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ["pdf", ...IMAGE_EXTENSIONS];

/**
 * Valida el adjunto contra las mismas reglas del backend. Sin esto el archivo
 * se rechazaba recién al guardar, con un error genérico que no explicaba nada.
 */
export const validateDocumentFile = (file: File): string | null => {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
    return "Formato no permitido. Solo se aceptan PDF, JPG o PNG.";
  }

  if (file.size > DOCUMENT_MAX_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return `El archivo pesa ${mb} MB y el máximo permitido es 10 MB.`;
  }

  return null;
};
