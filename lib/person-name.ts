type NamedPerson = {
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
};

type FormalPerson = NamedPerson & {
  middle_name?: string | null;
  second_last_name?: string | null;
};

/**
 * Iniciales para un avatar ("NA" para Nombre Apellido), siempre en mayúsculas.
 * Es la única forma de sacarlas: no se arman con `first_name?.[0]` a mano.
 */
export function initialsOf(person: NamedPerson | null | undefined): string {
  return `${person?.first_name?.trim()?.[0] ?? ""}${person?.last_name?.trim()?.[0] ?? ""}`.toUpperCase();
}

/**
 * Única forma de nombrar a una persona (usuario o empleado) en pantalla:
 * "NOMBRE APELLIDO", siempre en mayúsculas. Con nombre vacío cae al username
 * y, si tampoco hay, al `fallback`. El backend hace lo mismo con
 * `User::full_name`.
 */
export function fullName(
  person: NamedPerson | null | undefined,
  fallback = "",
): string {
  const name = [person?.first_name, person?.last_name]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");

  return (name || person?.username?.trim() || fallback).toUpperCase();
}

/**
 * Nombre completo con segundo nombre y segundo apellido, para documentos
 * formales (certificados, recibos). En mayúsculas; es el equivalente de
 * `PersonName::compose` del backend.
 */
export function formalName(person: FormalPerson | null | undefined): string {
  return [
    person?.first_name,
    person?.middle_name,
    person?.last_name,
    person?.second_last_name,
  ]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ")
    .toUpperCase();
}
/**
 * "APELLIDO, NOMBRE" — el orden de los listados y registros que se buscan por
 * apellido (certificados, exámenes). Es la única excepción al orden estándar
 * de `fullName`; es el equivalente de `PersonName::lastFirst` del backend.
 */
export function lastFirstName(
  person: NamedPerson | null | undefined,
  fallback = "",
): string {
  const last = person?.last_name?.trim() ?? "";
  const first = person?.first_name?.trim() ?? "";
  const name = last && first ? `${last}, ${first}` : last || first;

  return (name || person?.username?.trim() || fallback).toUpperCase();
}