import type { AirlineClient } from "@/types";
import { z } from "zod";

export const AIRLINE_DNI_TYPES = ["V", "J", "E"] as const;

const phoneRegex = /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/;

const same = (a?: string | null, b?: string | null) =>
  (a ?? "").trim().toUpperCase() === (b ?? "").trim().toUpperCase();

/**
 * Esquema del formulario de clientes de aerolínea. La tabla exige documento y
 * contacto, y nombre, documento y correo no pueden repetirse (sin distinguir
 * mayúsculas); al editar se ignora el propio cliente. El servidor repite las
 * reglas, esto solo las adelanta. Los días de crédito viajan como texto en el
 * formulario y se convierten a número al enviar.
 */
export const buildAirlineClientSchema = (
  clients: AirlineClient[] | undefined,
  ignoreId?: number,
) =>
  z
    .object({
      dni_type: z.string().trim().min(1, {
        message: "Seleccione el tipo de documento.",
      }),
      dni: z
        .string()
        .trim()
        .min(1, { message: "Ingrese el número de documento." })
        .min(7, { message: "El documento debe tener al menos 7 dígitos." })
        .max(11, { message: "El documento no puede superar los 11 dígitos." })
        .regex(/^\d+$/, { message: "El documento solo puede contener números." }),
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
      phone: z
        .string()
        .trim()
        .min(1, { message: "Ingrese el teléfono." })
        .min(10, { message: "El teléfono debe tener al menos 10 dígitos." })
        .max(15, { message: "El teléfono no puede superar los 15 dígitos." })
        .regex(phoneRegex, { message: "Número de teléfono inválido." }),
      email: z
        .string()
        .trim()
        .min(1, { message: "Ingrese el correo electrónico." })
        .max(255, { message: "El correo no puede superar los 255 caracteres." })
        .pipe(z.email({ message: "Ingrese un correo válido." })),
      address: z
        .string()
        .trim()
        .min(1, { message: "Ingrese la dirección." })
        .min(3, { message: "La dirección debe tener al menos 3 caracteres." })
        .max(100, { message: "La dirección no puede superar los 100 caracteres." }),
      pay_credit_days: z
        .string()
        .trim()
        .min(1, { message: "Ingrese los días de crédito (0 si no aplica)." })
        .regex(/^\d+$/, { message: "Solo se permiten números enteros." })
        .refine((days) => Number(days) <= 730, {
          message: "Máximo 730 días.",
        }),
    })
    .superRefine((values, ctx) => {
      const others = (clients ?? []).filter((client) => client.id !== ignoreId);
      const taken = (
        field: "name" | "dni" | "email",
        message: string,
      ) => {
        if (others.some((client) => same(client[field], values[field]))) {
          ctx.addIssue({ code: "custom", path: [field], message });
        }
      };

      taken("name", "Ya existe un cliente con ese nombre.");
      taken("dni", "Ya existe un cliente con ese documento.");
      taken("email", "Ya existe un cliente con ese correo.");
    });

export type AirlineClientFormValues = z.infer<
  ReturnType<typeof buildAirlineClientSchema>
>;

export const AIRLINE_CLIENT_FIELD_LABELS = {
  dni_type: "Tipo de documento",
  dni: "Documento",
  name: "Nombre",
  phone: "Teléfono",
  email: "Correo electrónico",
  address: "Dirección",
  pay_credit_days: "Días de crédito",
};

export type AirlineClientChanges = Partial<
  Omit<AirlineClientFormValues, "pay_credit_days">
> & { pay_credit_days?: number };

/** Solo lo que el usuario cambió respecto al cliente guardado. */
export const diffAirlineClient = (
  client: AirlineClient,
  values: AirlineClientFormValues,
): AirlineClientChanges => {
  const diff: AirlineClientChanges = {};
  if (!same(values.name, client.name)) diff.name = values.name;
  if (values.dni_type !== (client.dni_type ?? "").trim()) {
    diff.dni_type = values.dni_type;
  }
  if (values.dni !== (client.dni ?? "").trim()) diff.dni = values.dni;
  if (values.phone !== (client.phone ?? "").trim()) diff.phone = values.phone;
  if (values.email !== (client.email ?? "").trim()) diff.email = values.email;
  if (values.address !== (client.address ?? "").trim()) {
    diff.address = values.address;
  }
  if (Number(values.pay_credit_days) !== (client.pay_credit_days ?? 0)) {
    diff.pay_credit_days = Number(values.pay_credit_days);
  }
  return diff;
};
