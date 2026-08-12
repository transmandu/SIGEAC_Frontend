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
