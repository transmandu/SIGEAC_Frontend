import type { ThirdParty } from "@/types";
import { z } from "zod";

export const THIRD_PARTY_TYPE_OPTIONS = [
  { value: "CLIENT_COMPANY", label: "Cliente - Empresa" },
  { value: "CLIENT_PERSON", label: "Cliente - Persona" },
  { value: "OTHER", label: "Otro" },
] as const;

const TYPE_VALUES = THIRD_PARTY_TYPE_OPTIONS.map((option) => option.value);

const same = (a?: string | null, b?: string | null) =>
  (a ?? "").trim().toUpperCase() === (b ?? "").trim().toUpperCase();

/**
 * Esquema del formulario de terceros. Un tercero se identifica por su nombre y
 * su tipo (sin distinguir mayúsculas); al editar se ignora el propio. El
 * servidor repite la regla, esto solo la adelanta. El tipo es texto libre en el
 * esquema porque hay terceros heredados con un tipo fuera de la lista: pueden
 * editarse mientras no se toque su tipo.
 */
export const buildThirdPartySchema = (
  thirdParties: ThirdParty[] | undefined,
  current?: Pick<ThirdParty, "id" | "type">,
) =>
  z
    .object({
      name: z
        .string()
        .trim()
        .min(1, { message: "Ingrese el nombre del tercero." })
        .min(3, { message: "El nombre debe tener al menos 3 caracteres." })
        .max(255, { message: "El nombre no puede superar los 255 caracteres." }),
      type: z
        .string()
        .min(1, { message: "Seleccione un tipo." })
        .refine(
          (type) =>
            (TYPE_VALUES as readonly string[]).includes(type) ||
            type === current?.type,
          { message: "Seleccione un tipo válido." },
        ),
    })
    .superRefine((values, ctx) => {
      const taken = (thirdParties ?? []).some(
        (thirdParty) =>
          thirdParty.id !== current?.id &&
          thirdParty.type === values.type &&
          same(thirdParty.name, values.name),
      );

      if (taken) {
        ctx.addIssue({
          code: "custom",
          path: ["name"],
          message: "Ya existe un tercero con ese nombre y tipo.",
        });
      }
    });

export type ThirdPartyFormValues = z.infer<
  ReturnType<typeof buildThirdPartySchema>
>;

export const THIRD_PARTY_FIELD_LABELS = {
  name: "Nombre",
  type: "Tipo",
};

/** Solo lo que el usuario cambió respecto al tercero guardado. */
export const diffThirdParty = (
  thirdParty: Pick<ThirdParty, "name" | "type">,
  values: ThirdPartyFormValues,
): Partial<ThirdPartyFormValues> => {
  const diff: Partial<ThirdPartyFormValues> = {};
  if (values.name !== (thirdParty.name ?? "").trim()) diff.name = values.name;
  if (values.type !== thirdParty.type) diff.type = values.type;
  return diff;
};
