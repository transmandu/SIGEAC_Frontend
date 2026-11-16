/** Tope de la nota; el mismo que valida el backend. */
export const TRANSIT_UPDATE_NOTE_MAX = 2000;

/**
 * Frases sugeridas para la bitácora de tránsito: al pulsarlas se insertan en el
 * texto, que sigue siendo libre. Lo guardado es solo el texto.
 */
export const TRANSIT_UPDATE_SUGGESTIONS = [
  "El proveedor despachó el envío.",
  "El envío está en ruta.",
  "El envío está en aduana.",
  "El envío presenta un retraso.",
  "Hubo una incidencia con el envío.",
  "El envío llegará próximamente.",
] as const;

/** La sugerencia sin el punto final, para rotular su botón. */
export const suggestionLabel = (suggestion: string) =>
  suggestion.replace(/\.$/, "");

/**
 * Añade una sugerencia al final del texto, separada por una frase. Si no cabe
 * en el tope, deja el texto como estaba antes que cortarlo.
 */
export const appendSuggestion = (note: string, suggestion: string) => {
  const current = note.trimEnd();

  if (current === "") return suggestion;

  const separator = /[.!?:;]$/.test(current) ? " " : ". ";
  const next = `${current}${separator}${suggestion}`;

  return next.length > TRANSIT_UPDATE_NOTE_MAX ? note : next;
};
