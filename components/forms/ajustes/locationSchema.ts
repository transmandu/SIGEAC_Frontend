import type { Location } from "@/types";
import { locationName } from "@/lib/locations";
import { z } from "zod";

/** La bandera es la única fuente de si la sede es principal o alterna. */
export const baseKindLabel = (isMainBase: boolean) =>
  isMainBase ? "Base Principal" : "Base Alterna";

const norm = (value: string | null | undefined) =>
  (value ?? "").trim().toLowerCase();

/** La base principal vigente, sin contar la sede que se está editando. */
export const findMainBase = (
  locations: Location[] | undefined,
  ignoreId?: number,
) =>
  (locations ?? []).find(
    (location) => location.isMainBase && location.id !== ignoreId,
  );

/**
 * Esquema del formulario de sedes. El código IATA son tres letras y, junto con
 * el nombre (o la ciudad, si no lo tiene), identifica a la sede en los
 * selectores ("CBL - Edificio Norte"): esa pareja no puede repetirse, pero dos
 * sedes de una misma ciudad son válidas si se llaman distinto. Al editar se
 * ignora la propia. El servidor repite la regla, esto solo la adelanta.
 */
export const buildLocationSchema = (
  locations: Location[] | undefined,
  current?: Location,
) =>
  z
    .object({
      address: z
        .string()
        .trim()
        .min(1, { message: "Ingrese la ciudad o dirección de la sede." })
        .max(255, { message: "No puede superar los 255 caracteres." }),
      name: z
        .string()
        .trim()
        .max(255, { message: "No puede superar los 255 caracteres." }),
      cod_iata: z
        .string()
        .trim()
        .min(1, { message: "Ingrese el código IATA." })
        .regex(/^[A-Za-z]{3}$/, {
          message: "El código IATA son exactamente 3 letras.",
        }),
      isMainBase: z.boolean(),
    })
    .refine(
      (values) =>
        !(locations ?? []).some(
          (location) =>
            location.id !== current?.id &&
            norm(location.cod_iata) === norm(values.cod_iata) &&
            norm(locationName(location)) ===
              norm(values.name || values.address),
        ),
      {
        path: ["cod_iata"],
        message:
          "Ya existe una sede con ese código IATA y ese nombre. Dele un nombre distinto para diferenciarla.",
      },
    );

export type LocationFormValues = z.infer<
  ReturnType<typeof buildLocationSchema>
>;

export const LOCATION_FIELD_LABELS = {
  address: "Ciudad o dirección",
  name: "Nombre de la sede",
  cod_iata: "Código IATA",
  isMainBase: "Base principal",
};

/** Lo que viaja al crear. */
export const toCreatePayload = (values: LocationFormValues) => ({
  address: values.address.trim(),
  name: values.name.trim() || null,
  cod_iata: values.cod_iata.trim().toUpperCase(),
  isMainBase: values.isMainBase,
});

/** Solo lo que el usuario cambió respecto a la sede guardada. */
export const diffLocation = (
  location: Pick<Location, "address" | "name" | "cod_iata" | "isMainBase">,
  values: LocationFormValues,
) => {
  const diff: Partial<ReturnType<typeof toCreatePayload>> = {};

  if (values.address.trim() !== (location.address ?? "").trim()) {
    diff.address = values.address.trim();
  }
  if (values.name.trim() !== (location.name ?? "").trim()) {
    diff.name = values.name.trim() || null;
  }
  if (norm(values.cod_iata) !== norm(location.cod_iata)) {
    diff.cod_iata = values.cod_iata.trim().toUpperCase();
  }
  if (values.isMainBase !== !!location.isMainBase) {
    diff.isMainBase = values.isMainBase;
  }

  return diff;
};
