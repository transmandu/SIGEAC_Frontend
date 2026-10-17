import type { ShippingAgency } from "@/types";
import { z } from "zod";
import { phoneSchema, toPhoneValue } from "@/lib/phone";

export const SHIPPING_AGENCY_TYPE_LABELS = {
  NATIONAL: "Nacional",
  INTERNATIONAL: "Internacional",
} as const;

const TYPES = ["NATIONAL", "INTERNATIONAL"] as const;

const same = (a?: string | null, b?: string | null) =>
  (a ?? "").trim().toUpperCase() === (b ?? "").trim().toUpperCase();

/**
 * Esquema del formulario de agencias de envío. El código es el identificador
 * corto que usan las órdenes de compra, así que no puede repetirse; el nombre
 * solo dentro de un mismo tipo (ambos sin distinguir mayúsculas). Al editar se
 * ignora la propia agencia. El servidor repite las reglas, esto solo las
 * adelanta. Descripción, teléfono y correo son opcionales.
 */
export const buildShippingAgencySchema = (
  agencies: ShippingAgency[] | undefined,
  ignoreId?: ShippingAgency["id"],
  /** Teléfono ya guardado: se admite sin cambios aunque sea un dato antiguo inválido. */
  keepPhone?: string | null,
) =>
  z
    .object({
      name: z
        .string()
        .trim()
        .min(1, { message: "Ingrese el nombre de la agencia." })
        .min(2, { message: "El nombre debe tener al menos 2 caracteres." })
        .max(255, {
          message: "El nombre no puede superar los 255 caracteres.",
        }),
      code: z
        .string()
        .trim()
        .min(1, { message: "Ingrese el código de la agencia." })
        .min(2, { message: "El código debe tener al menos 2 caracteres." })
        .max(50, { message: "El código no puede superar los 50 caracteres." }),
      description: z.string().trim().max(1000, {
        message: "La descripción no puede superar los 1000 caracteres.",
      }),
      type: z.enum(TYPES, { error: "Seleccione el tipo de agencia." }),
      phone: phoneSchema({ keep: keepPhone }),
      email: z
        .string()
        .trim()
        .max(255, { message: "El correo no puede superar los 255 caracteres." })
        .refine((email) => email === "" || z.email().safeParse(email).success, {
          message: "Ingrese un correo válido.",
        }),
    })
    .superRefine((values, ctx) => {
      const others = (agencies ?? []).filter(
        (agency) => agency.id !== ignoreId,
      );

      if (others.some((agency) => same(agency.code, values.code))) {
        ctx.addIssue({
          code: "custom",
          path: ["code"],
          message: "Ya existe una agencia con ese código.",
        });
      }

      if (
        others.some(
          (agency) =>
            agency.type === values.type && same(agency.name, values.name),
        )
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["name"],
          message: "Ya existe una agencia con ese nombre y tipo.",
        });
      }
    });

export type ShippingAgencyFormValues = z.infer<
  ReturnType<typeof buildShippingAgencySchema>
>;

export const SHIPPING_AGENCY_FIELD_LABELS = {
  name: "Nombre",
  code: "Código",
  description: "Descripción",
  type: "Tipo",
  phone: "Teléfono",
  email: "Correo electrónico",
};

/**
 * Solo lo que el usuario cambió respecto a la agencia guardada. El servidor
 * guarda casi todo en mayúsculas y el correo en minúsculas, así que lo
 * guardado se compara sin distinguir mayúsculas: volver a escribir lo mismo no
 * cuenta como cambio.
 */
export const diffShippingAgency = (
  agency: Pick<
    ShippingAgency,
    "name" | "code" | "description" | "type" | "phone" | "email"
  >,
  values: ShippingAgencyFormValues,
): Partial<ShippingAgencyFormValues> => {
  const diff: Partial<ShippingAgencyFormValues> = {};
  if (!same(values.name, agency.name)) diff.name = values.name;
  if (!same(values.code, agency.code)) diff.code = values.code;
  if (!same(values.description, agency.description)) {
    diff.description = values.description;
  }
  if (values.type !== agency.type) diff.type = values.type;
  if (values.phone !== toPhoneValue(agency.phone)) diff.phone = values.phone;
  if (!same(values.email, agency.email)) diff.email = values.email;
  return diff;
};
