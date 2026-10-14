import axios from "axios";

/**
 * Mensaje legible de un error de la API: el `message` que manda el backend
 * (422/409 traen el motivo real) o, si no hay respuesta, el texto de respaldo.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      { message?: unknown; errors?: Record<string, string[]> } | undefined;

    const firstValidation = data?.errors
      ? Object.values(data.errors).flat()[0]
      : undefined;

    if (firstValidation) return firstValidation;
    if (typeof data?.message === "string" && data.message) return data.message;
    if (!error.response) return "No se pudo conectar con el servidor.";
  }

  return fallback;
}
