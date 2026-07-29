/**
 * Las ubicaciones son códigos por tramos: "C-1", "A-2-1". Un `includes` sobre
 * el texto crudo falla en los dos sentidos: "A-1" trae "A-11" y "A-21", y
 * escribir "A1" o "a 1" no trae nada. Aquí se comparan los tramos.
 */

/** "a-2 . 1" -> ["A","2","1"]; separa también letra/número pegados ("C1"). */
const segmentsOf = (value: string): string[] =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    // Cualquier separador (guión, punto, espacio, barra) delimita un tramo.
    .split(/[^A-Z0-9]+/)
    .flatMap((chunk) => chunk.match(/[A-Z]+|[0-9]+/g) ?? [])
    .filter(Boolean);

/**
 * Coincide si los tramos escritos son un prefijo exacto de los de la ubicación:
 * "A-2" trae "A-2" y "A-2-1" (todo el estante), "A" trae toda la fila A, y
 * "A-1" no trae "A-11" porque cada tramo debe calzar completo.
 *
 * Debe coincidir con el filtro `zone` del backend: la tabla filtra la página
 * cargada con la misma regla con que el servidor filtró el inventario completo.
 */
export const zoneMatches = (zone: string | null | undefined, query: string): boolean => {
  const wanted = segmentsOf(query);
  if (!wanted.length) return true;

  const actual = segmentsOf(zone ?? "");
  if (actual.length < wanted.length) return false;

  return wanted.every((segment, i) => actual[i] === segment);
};
