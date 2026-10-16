import type { Manufacturer } from "@/types";
import { z } from "zod";

export type ManufacturerType = Manufacturer["type"];

export const MANUFACTURER_TYPE_LABELS: Record<ManufacturerType, string> = {
  AIRCRAFT: "Aeronave",
  ENGINE: "Plantas de Poder",
  APU: "APU",
  PROPELLER: "Hélice",
  GENERAL: "Piezas en General",
  PART: "Partes/Componentes",
  TOOL: "Herramientas",
};

export const MANUFACTURER_TYPES = Object.keys(MANUFACTURER_TYPE_LABELS) as [
  ManufacturerType,
  ...ManufacturerType[],
];

const same = (a: string, b: string) =>
  a.trim().toUpperCase() === b.trim().toUpperCase();

/**
 * Esquema del formulario de fabricantes. Un fabricante se identifica por su
 * abreviatura y su tipo (puede haber un "GE" de motores y otro de piezas), así
 * que lo que no puede repetirse es la pareja; al editar se ignora el propio.
 * El servidor repite la regla, esto solo la adelanta.
 */
export const buildManufacturerSchema = (
  manufacturers: Manufacturer[] | undefined,
  ignoreId?: number,
) =>
  z
    .object({
      name: z
        .string()
        .trim()
        .min(1, { message: "Ingrese la abreviatura del fabricante." })
        .min(2, { message: "La abreviatura debe tener al menos 2 caracteres." })
        .max(255, {
          message: "La abreviatura no puede superar los 255 caracteres.",
        }),
      description: z.string().trim().max(255, {
        message: "El nombre completo no puede superar los 255 caracteres.",
      }),
      type: z.enum(MANUFACTURER_TYPES, { error: "Seleccione un tipo" }),
    })
    .superRefine((values, ctx) => {
      const taken = (manufacturers ?? []).some(
        (manufacturer) =>
          manufacturer.id !== ignoreId &&
          manufacturer.type === values.type &&
          same(manufacturer.name ?? "", values.name),
      );

      if (taken) {
        ctx.addIssue({
          code: "custom",
          path: ["name"],
          message: "Ya existe un fabricante con ese nombre y tipo.",
        });
      }
    });

export type ManufacturerFormValues = z.infer<
  ReturnType<typeof buildManufacturerSchema>
>;

export const MANUFACTURER_FIELD_LABELS = {
  name: "Abreviatura",
  description: "Nombre completo",
  type: "Tipo",
};

/** Solo lo que el usuario cambió respecto al fabricante guardado. */
export const diffManufacturer = (
  manufacturer: Pick<Manufacturer, "name" | "description" | "type">,
  values: ManufacturerFormValues,
): Partial<ManufacturerFormValues> => {
  const diff: Partial<ManufacturerFormValues> = {};
  if (!same(values.name, manufacturer.name ?? "")) diff.name = values.name;
  if (values.type !== manufacturer.type) diff.type = values.type;
  if (values.description !== (manufacturer.description ?? "").trim()) {
    diff.description = values.description;
  }
  return diff;
};
