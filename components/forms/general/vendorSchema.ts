import type { Vendor } from "@/types";
import { z } from "zod";

export type VendorType = Vendor["type"];

export const VENDOR_TYPE_LABELS: Record<VendorType, string> = {
  VENDOR: "Proveedor",
  BENEFICIARY: "Beneficiario",
};

const VENDOR_TYPES = ["VENDOR", "BENEFICIARY"] as const;

const same = (a: string, b: string) =>
  a.trim().toUpperCase() === b.trim().toUpperCase();

/**
 * Esquema del formulario de proveedores. Un proveedor se identifica por su
 * nombre y su tipo (sin distinguir mayúsculas); al editar se ignora el propio.
 * El servidor repite la regla, esto solo la adelanta. La dirección es opcional:
 * es la única columna que admite nulos y hay proveedores guardados sin ella.
 */
export const buildVendorSchema = (
  vendors: Vendor[] | undefined,
  ignoreId?: Vendor["id"],
) =>
  z
    .object({
      name: z
        .string()
        .trim()
        .min(1, { message: "Ingrese el nombre del proveedor." })
        .min(2, { message: "El nombre debe tener al menos 2 caracteres." })
        .max(255, { message: "El nombre no puede superar los 255 caracteres." }),
      phone: z
        .string()
        .trim()
        .min(1, { message: "Ingrese el teléfono." })
        .max(20, { message: "El teléfono no puede superar los 20 caracteres." }),
      email: z
        .string()
        .trim()
        .min(1, { message: "Ingrese el correo electrónico." })
        .max(255, { message: "El correo no puede superar los 255 caracteres." })
        .pipe(z.email({ message: "Ingrese un correo válido." })),
      address: z
        .string()
        .trim()
        .max(100, { message: "La dirección no puede superar los 100 caracteres." })
        .refine((value) => value === "" || value.length >= 2, {
          message: "La dirección debe tener al menos 2 caracteres.",
        }),
      type: z.enum(VENDOR_TYPES, { error: "Seleccione un tipo" }),
    })
    .superRefine((values, ctx) => {
      const taken = (vendors ?? []).some(
        (vendor) =>
          vendor.id !== ignoreId &&
          vendor.type === values.type &&
          same(vendor.name ?? "", values.name),
      );

      if (taken) {
        ctx.addIssue({
          code: "custom",
          path: ["name"],
          message: "Ya existe un registro con ese nombre y tipo.",
        });
      }
    });

export type VendorFormValues = z.infer<ReturnType<typeof buildVendorSchema>>;

export const VENDOR_FIELD_LABELS = {
  name: "Nombre",
  phone: "Teléfono",
  email: "Correo electrónico",
  address: "Dirección",
  type: "Tipo",
};

/** Solo lo que el usuario cambió respecto al proveedor guardado. */
export const diffVendor = (
  vendor: Pick<Vendor, "name" | "phone" | "email" | "address" | "type">,
  values: VendorFormValues,
): Partial<VendorFormValues> => {
  const diff: Partial<VendorFormValues> = {};
  if (values.name !== (vendor.name ?? "").trim()) diff.name = values.name;
  if (values.phone !== (vendor.phone ?? "").trim()) diff.phone = values.phone;
  if (values.email.toLowerCase() !== (vendor.email ?? "").trim().toLowerCase()) {
    diff.email = values.email;
  }
  if (values.address !== (vendor.address ?? "").trim()) {
    diff.address = values.address;
  }
  if (values.type !== vendor.type) diff.type = values.type;
  return diff;
};
