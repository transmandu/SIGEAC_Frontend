import type { Retailer } from "@/types";
import { z } from "zod";

const same = (a: string, b: string) =>
  a.trim().toUpperCase() === b.trim().toUpperCase();

/**
 * Esquema del formulario de comercios. El nombre no puede repetirse entre
 * comercios (sin distinguir mayúsculas); al editar se ignora el propio. El
 * servidor repite la regla, esto solo la adelanta. Teléfono y ubicación son
 * opcionales.
 */
export const buildRetailerSchema = (
  retailers: Retailer[] | undefined,
  ignoreId?: Retailer["id"],
) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(1, { message: "Ingrese el nombre del comercio." })
      .min(2, { message: "El nombre debe tener al menos 2 caracteres." })
      .max(100, { message: "El nombre no puede superar los 100 caracteres." })
      .refine(
        (name) =>
          !(retailers ?? []).some(
            (retailer) =>
              retailer.id !== ignoreId && same(retailer.name ?? "", name),
          ),
        { message: "Ya existe un comercio con ese nombre." },
      ),
    phone: z
      .string()
      .trim()
      .max(50, { message: "El teléfono no puede superar los 50 caracteres." }),
    address: z
      .string()
      .trim()
      .max(255, {
        message: "La ubicación no puede superar los 255 caracteres.",
      }),
  });

export type RetailerFormValues = z.infer<
  ReturnType<typeof buildRetailerSchema>
>;

export const RETAILER_FIELD_LABELS = {
  name: "Nombre",
  phone: "Teléfono",
  address: "Ubicación",
};

/** Solo lo que el usuario cambió respecto al comercio guardado. */
export const diffRetailer = (
  retailer: Pick<Retailer, "name" | "phone" | "address">,
  values: RetailerFormValues,
): Partial<RetailerFormValues> => {
  const diff: Partial<RetailerFormValues> = {};
  if (values.name !== (retailer.name ?? "").trim()) diff.name = values.name;
  if (values.phone !== (retailer.phone ?? "").trim()) diff.phone = values.phone;
  if (values.address !== (retailer.address ?? "").trim()) {
    diff.address = values.address;
  }
  return diff;
};
