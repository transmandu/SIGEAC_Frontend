import type { AeronauticalClient } from "@/types";
import { z } from "zod";

export const AERONAUTICAL_DNI_TYPES = ["V", "J", "E"] as const;

export const AUTHORIZING_LABELS = {
  PROPIETARIO: "Propietario",
  EXPLOTADOR: "Explotador",
} as const;

const phoneRegex = /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/;

const same = (a?: string | null, b?: string | null) =>
  (a ?? "").trim().toUpperCase() === (b ?? "").trim().toUpperCase();

/** Vacío es válido (el campo es opcional); si trae texto, se valida con su regla. */
const optional = (schema: z.ZodString) =>
  z
    .string()
    .trim()
    .superRefine((value, ctx) => {
      if (value === "") return;
      const result = schema.safeParse(value);
      if (!result.success) {
        for (const issue of result.error.issues) {
          ctx.addIssue({ code: "custom", message: issue.message });
        }
      }
    });

/**
 * Esquema del formulario de clientes de OMAC. Solo el nombre y el tipo de
 * cliente son obligatorios; documento y contacto son opcionales, y el nombre
 * no puede repetirse (sin distinguir mayúsculas). Al editar se ignora el
 * propio cliente. Documento y correo no se exigen únicos porque ya hay clientes
 * que comparten valores históricos. El servidor repite las reglas.
 */
export const buildAeronauticalClientSchema = (
  clients: AeronauticalClient[] | undefined,
  ignoreId?: number,
) =>
  z
    .object({
      name: z
        .string()
        .trim()
        .min(1, { message: "Ingrese el nombre del cliente." })
        .min(3, { message: "El nombre debe tener al menos 3 caracteres." })
        .max(40, { message: "El nombre no puede superar los 40 caracteres." })
        .regex(
          /^[\p{L}\p{N}\s.,&'-]+$/u,
          "El nombre solo admite letras, números, espacios y . , & ' -",
        ),
      authorizing: z.enum(["PROPIETARIO", "EXPLOTADOR"], {
        error: "Seleccione si es Propietario o Explotador.",
      }),
      dni_type: z.string().trim(),
      dni: optional(
        z
          .string()
          .min(7, { message: "El documento debe tener al menos 7 dígitos." })
          .max(11, { message: "El documento no puede superar los 11 dígitos." })
          .regex(/^\d+$/, {
            message: "El documento solo puede contener números.",
          }),
      ),
      phone: optional(
        z
          .string()
          .min(10, { message: "El teléfono debe tener al menos 10 dígitos." })
          .max(15, { message: "El teléfono no puede superar los 15 dígitos." })
          .regex(phoneRegex, { message: "Número de teléfono inválido." }),
      ),
      email: optional(
        z
          .string()
          .max(255, { message: "El correo no puede superar los 255 caracteres." })
          .email({ message: "Ingrese un correo válido." }),
      ),
      address: optional(
        z
          .string()
          .min(3, { message: "La dirección debe tener al menos 3 caracteres." })
          .max(100, {
            message: "La dirección no puede superar los 100 caracteres.",
          }),
      ),
    })
    .superRefine((values, ctx) => {
      if (values.dni && !values.dni_type) {
        ctx.addIssue({
          code: "custom",
          path: ["dni_type"],
          message: "Seleccione el tipo de documento.",
        });
      }

      const taken = (clients ?? []).some(
        (client) => client.id !== ignoreId && same(client.name, values.name),
      );
      if (taken) {
        ctx.addIssue({
          code: "custom",
          path: ["name"],
          message: "Ya existe un cliente con ese nombre.",
        });
      }
    });

export type AeronauticalClientFormValues = z.infer<
  ReturnType<typeof buildAeronauticalClientSchema>
>;

export const AERONAUTICAL_CLIENT_FIELD_LABELS = {
  name: "Nombre",
  authorizing: "Tipo de cliente",
  dni_type: "Tipo de documento",
  dni: "Documento",
  phone: "Teléfono",
  email: "Correo electrónico",
  address: "Dirección",
};

export type AeronauticalClientChanges = Partial<
  Omit<AeronauticalClientFormValues, "dni_type">
> & { dni_type?: string | null };

/**
 * Solo lo que el usuario cambió respecto al cliente guardado. Documento y tipo
 * viajan siempre juntos: el servidor exige uno cuando llega el otro, y sin
 * documento el tipo se borra.
 */
export const diffAeronauticalClient = (
  client: AeronauticalClient,
  values: AeronauticalClientFormValues,
): AeronauticalClientChanges => {
  const diff: AeronauticalClientChanges = {};
  if (!same(values.name, client.name)) diff.name = values.name;
  if (values.authorizing !== client.authorizing) {
    diff.authorizing = values.authorizing;
  }

  const dniType = values.dni ? values.dni_type : "";
  if (
    values.dni !== (client.dni ?? "").trim() ||
    dniType !== (client.dni_type ?? "").trim()
  ) {
    diff.dni = values.dni;
    diff.dni_type = dniType || null;
  }

  if (values.phone !== (client.phone ?? "").trim()) diff.phone = values.phone;
  if (values.email !== (client.email ?? "").trim()) diff.email = values.email;
  if (values.address !== (client.address ?? "").trim()) {
    diff.address = values.address;
  }
  return diff;
};
