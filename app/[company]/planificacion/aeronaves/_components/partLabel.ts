/**
 * Nombre con el que se muestra una parte. `aircraft_parts` ya no guarda
 * `part_name` (la migración lo eliminó): la parte se identifica por su tipo
 * (MOTOR, APU...) y, si lo tiene, por su descripción.
 */
export const partLabel = (
  part?: { type?: string | null; description?: string | null } | null,
): string => part?.type?.trim() || part?.description?.trim() || "Parte";
