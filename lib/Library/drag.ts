/**
 * Arrastrar documentos de la biblioteca. Una fila lleva todos los documentos
 * seleccionados si es una de ellos; las carpetas leen la lista con
 * `readDraggedDocumentIds`. `text/plain` (el id de la fila) se conserva por
 * compatibilidad con quien solo lea uno.
 */
export const DOCS_MIME = "application/x-library-docs";

export const hasDraggedDocuments = (dt: DataTransfer): boolean =>
  dt.types.includes(DOCS_MIME) || dt.types.includes("text/plain");

export function readDraggedDocumentIds(dt: DataTransfer): number[] {
  const raw = dt.getData(DOCS_MIME);

  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map(Number).filter((id) => Number.isFinite(id));
      }
    } catch {
      // cae al id suelto
    }
  }

  const single = Number(dt.getData("text/plain"));
  return Number.isFinite(single) && single > 0 ? [single] : [];
}
