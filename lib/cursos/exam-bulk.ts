/** Formatos que acepta la carga masiva de exámenes. */
export const EXAM_BULK_ACCEPTED_EXTENSIONS = [
  "pdf",
  "jpg",
  "jpeg",
  "png",
  "webp",
];

export const isAllowedExamFile = (file: File) => {
  const byMime =
    file.type === "application/pdf" ||
    file.type === "image/jpeg" ||
    file.type === "image/png" ||
    file.type === "image/webp";

  return byMime || /\.(pdf|jpe?g|png|webp)$/i.test(file.name);
};

/**
 * El contrato del nombre es `dni_nombre_apellido`. Se admite también
 * `V-12345678_nombre` por si el DNI viene con su tipo.
 */
export const extractDniFromFileName = (fileName: string): string | null => {
  const baseName = fileName.replace(/\.[^/.]+$/, "").trim();
  const match = baseName.match(/^([A-Za-z]?[-\s]?\d{5,12})(?=[_\-\s]|$)/);

  return match ? match[1].trim() : null;
};

export const normalizeDni = (dni: string) =>
  dni.replace(/[^0-9a-z]/gi, "").toUpperCase();

export const buildFileId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};
