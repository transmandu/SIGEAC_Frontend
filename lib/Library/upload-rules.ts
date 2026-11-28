/** Qué archivos admite la biblioteca al subir (el servidor aplica las mismas reglas). */
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const ALLOWED_EXTENSIONS = ["pdf", "xlsx", "xls"];

/** Mensaje de por qué no sirve el archivo, o `null` si es válido. */
export function fileProblem(file: File): string | null {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return "Solo se permiten archivos PDF o Excel.";
  }

  if (file.size > MAX_FILE_BYTES) {
    return "El archivo supera los 10 MB permitidos.";
  }

  return null;
}
