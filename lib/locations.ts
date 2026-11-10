/** Lo mínimo de una sede para nombrarla; cualquier forma de sede del sistema lo cumple. */
interface NamedLocation {
  name?: string | null;
  address?: string | null;
  cod_iata?: string | null;
}

/** Cómo se llama la sede: su nombre y, sin él, su ciudad. */
export const locationName = (location: NamedLocation | null | undefined) =>
  location?.name?.trim() || location?.address?.trim() || "";

/**
 * Cómo se reconoce la sede en los selectores: "CBL - Edificio Norte", o
 * "CBL - Ciudad Bolívar" cuando no tiene nombre.
 */
export const locationLabel = (
  location: NamedLocation | null | undefined,
  separator = " - ",
) =>
  [location?.cod_iata?.trim(), locationName(location)]
    .filter(Boolean)
    .join(separator);

/**
 * Para los selectores que solo mostraban el código IATA: el código y, solo si
 * la sede tiene nombre, ese nombre ("CBL" o "CBL - Edificio Norte"). Así dos
 * sedes con el mismo código siguen siendo distinguibles sin alargar el resto.
 */
export const locationShortLabel = (
  location: NamedLocation | null | undefined,
) => {
  const code = location?.cod_iata?.trim() ?? "";
  const name = location?.name?.trim() ?? "";

  return [code, name].filter(Boolean).join(" - ") || locationName(location);
};
