/**
 * Codifica una ruta de archivo para pasarla por URL (base64 URL-safe), que es
 * justo el formato que espera el backend en PrivateFiles::decode.
 */
export const encodeExamFilePath = (path: string) =>
  btoa(path).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

/**
 * URL del endpoint que sirve el documento de examen de un participante
 * (`/{company}/course-exam-attendance/document/{filePath}`). Devuelve null si
 * falta la compañía o la ruta del documento.
 */
export const getExamDocumentUrl = (
  companySlug: string | undefined,
  documentPath?: string | null,
) => {
  if (!companySlug || !documentPath) return null;

  const normalizedPath = documentPath.replace(/^\/+/, "");
  return `/general/${companySlug}/course-exam-attendance/document/${encodeExamFilePath(normalizedPath)}`;
};
