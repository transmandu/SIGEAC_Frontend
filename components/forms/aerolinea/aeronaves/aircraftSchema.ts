import { format } from "date-fns";
import { z } from "zod";
import type { AirlineAircraftPayload } from "@/actions/aerolinea/aeronaves/actions";
import type { AirlineAircraft } from "@/types";

/** Valor del selector para "sin fabricante" (solo válido en aeronaves externas). */
export const NO_MANUFACTURER = "none";

const STATUSES = ["EN POSESION", "RENTADO", "VENDIDO"] as const;

const same = (a?: string | null, b?: string | null) =>
  (a ?? "").trim().toUpperCase() === (b ?? "").trim().toUpperCase();

const hasManufacturer = (value?: string) => !!value && value !== NO_MANUFACTURER;

/**
 * Esquema del formulario de aeronaves de aerolínea. Matrícula y serial no
 * pueden repetirse (sin distinguir mayúsculas); al editar se ignora la propia
 * aeronave. El fabricante es obligatorio salvo en las externas. El servidor
 * repite las reglas, esto solo las adelanta.
 */
export const buildAircraftSchema = (
  aircrafts: AirlineAircraft[] | undefined,
  ignoreId?: number,
) =>
  z
    .object({
      acronym: z
        .string()
        .trim()
        .min(1, "Ingrese la matrícula.")
        .min(2, "La matrícula debe tener al menos 2 caracteres.")
        .max(8, "La matrícula no puede superar los 8 caracteres."),
      serial: z
        .string()
        .trim()
        .min(1, "Ingrese el serial.")
        .min(2, "El serial debe tener al menos 2 caracteres.")
        .max(20, "El serial no puede superar los 20 caracteres."),
      brand: z
        .string()
        .trim()
        .min(1, "Ingrese la marca.")
        .min(2, "La marca debe tener al menos 2 caracteres.")
        .max(30, "La marca no puede superar los 30 caracteres."),
      model: z
        .string()
        .trim()
        .min(1, "Ingrese el modelo.")
        .min(2, "El modelo debe tener al menos 2 caracteres.")
        .max(30, "El modelo no puede superar los 30 caracteres."),
      owner: z
        .string()
        .trim()
        .min(1, "Ingrese el propietario.")
        .min(2, "El propietario debe tener al menos 2 caracteres.")
        .max(30, "El propietario no puede superar los 30 caracteres."),
      fabricant_date: z
        .date({ error: "Seleccione la fecha de fabricación." })
        // Se evalúa al validar: un `max(new Date())` fijaría "ahora" al cargar el módulo.
        .refine((date) => date <= new Date(), {
          message: "La fecha de fabricación no puede ser futura.",
        }),
      status: z.enum(STATUSES, { error: "Seleccione el estado." }),
      location_id: z.string().min(1, "Seleccione la ubicación."),
      manufacturer_id: z.string(),
      comments: z
        .string()
        .trim()
        .max(100, "Los comentarios no pueden superar los 100 caracteres."),
      is_external: z.boolean(),
      inac: z.boolean(),
    })
    .superRefine((values, ctx) => {
      if (!values.is_external && !hasManufacturer(values.manufacturer_id)) {
        ctx.addIssue({
          code: "custom",
          path: ["manufacturer_id"],
          message: "El fabricante es obligatorio para una aeronave propia.",
        });
      }

      const others = (aircrafts ?? []).filter(
        (aircraft) => aircraft.id !== ignoreId,
      );

      if (others.some((aircraft) => same(aircraft.acronym, values.acronym))) {
        ctx.addIssue({
          code: "custom",
          path: ["acronym"],
          message: "Ya existe una aeronave con esa matrícula.",
        });
      }
      if (others.some((aircraft) => same(aircraft.serial, values.serial))) {
        ctx.addIssue({
          code: "custom",
          path: ["serial"],
          message: "Ya existe una aeronave con ese serial.",
        });
      }
    });

export type AircraftFormValues = z.infer<ReturnType<typeof buildAircraftSchema>>;

export const AIRCRAFT_FIELD_LABELS = {
  acronym: "Matrícula",
  serial: "Serial",
  brand: "Marca",
  model: "Modelo",
  owner: "Propietario",
  fabricant_date: "Fecha de fabricación",
  status: "Estado",
  location_id: "Ubicación",
  manufacturer_id: "Fabricante",
  comments: "Comentarios",
  is_external: "Aeronave externa",
  inac: "Registro INAC",
};

const manufacturerId = (value: string) =>
  hasManufacturer(value) ? Number(value) : null;

/** Cuerpo completo para crear. */
export const toCreatePayload = (
  values: AircraftFormValues,
): AirlineAircraftPayload => ({
  acronym: values.acronym,
  serial: values.serial,
  brand: values.brand,
  model: values.model,
  owner: values.owner,
  status: values.status,
  fabricant_date: format(values.fabricant_date, "yyyy-MM-dd"),
  location_id: Number(values.location_id),
  manufacturer_id: manufacturerId(values.manufacturer_id),
  comments: values.comments || null,
  is_external: values.is_external,
  inac: values.inac,
});

/** Solo lo que el usuario cambió respecto a la aeronave guardada. */
export const diffAircraft = (
  aircraft: AirlineAircraft,
  values: AircraftFormValues,
): Partial<AirlineAircraftPayload> => {
  const next = toCreatePayload(values);
  const diff: Partial<AirlineAircraftPayload> = {};

  if (!same(next.acronym, aircraft.acronym)) diff.acronym = next.acronym;
  if (!same(next.serial, aircraft.serial)) diff.serial = next.serial;
  if (next.brand !== (aircraft.brand ?? "").trim()) diff.brand = next.brand;
  if (next.model !== (aircraft.model ?? "").trim()) diff.model = next.model;
  if (next.owner !== (aircraft.owner ?? "").trim()) diff.owner = next.owner;
  if (next.fabricant_date !== aircraft.fabricant_date.slice(0, 10)) {
    diff.fabricant_date = next.fabricant_date;
  }
  if (next.status !== aircraft.status) diff.status = next.status;
  if (next.location_id !== aircraft.location_id) {
    diff.location_id = next.location_id;
  }
  if (next.manufacturer_id !== (aircraft.manufacturer_id ?? null)) {
    diff.manufacturer_id = next.manufacturer_id;
  }
  if (next.comments !== ((aircraft.comments ?? "").trim() || null)) {
    diff.comments = next.comments;
  }
  if (next.is_external !== aircraft.is_external) {
    diff.is_external = next.is_external;
  }
  if (next.inac !== aircraft.inac) diff.inac = next.inac;

  return diff;
};
