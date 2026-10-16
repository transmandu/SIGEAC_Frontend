import type { InformationSource } from "@/types";
import { z } from "zod";

export const INFORMATION_SOURCE_TYPES = [
  "PROACTIVO",
  "REACTIVO",
  "PREDICTIVO",
] as const;

const same = (a?: string | null, b?: string | null) =>
  (a ?? "").trim().toUpperCase() === (b ?? "").trim().toUpperCase();

/**
 * Esquema del formulario de fuentes de información. El nombre no puede
 * repetirse (sin distinguir mayúsculas), porque los reportes cuentan las
 * identificaciones por nombre de fuente; al editar se ignora la propia. El
 * servidor repite la regla, esto solo la adelanta.
 */
export const buildInformationSourceSchema = (
  sources: InformationSource[] | undefined,
  ignoreId?: InformationSource["id"],
) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(1, { message: "Ingrese el nombre de la fuente." })
      .min(2, { message: "El nombre debe tener al menos 2 caracteres." })
      .max(50, { message: "El nombre no puede superar los 50 caracteres." })
      .refine(
        (name) =>
          !(sources ?? []).some(
            (source) =>
              String(source.id) !== String(ignoreId) && same(source.name, name),
          ),
        { message: "Ya existe una fuente de información con ese nombre." },
      ),
    type: z.enum(INFORMATION_SOURCE_TYPES, { error: "Seleccione un tipo." }),
  });

export type InformationSourceFormValues = z.infer<
  ReturnType<typeof buildInformationSourceSchema>
>;

export const INFORMATION_SOURCE_FIELD_LABELS = {
  name: "Nombre",
  type: "Tipo",
};

/** Solo lo que el usuario cambió respecto a la fuente guardada. */
export const diffInformationSource = (
  source: Pick<InformationSource, "name" | "type">,
  values: InformationSourceFormValues,
): Partial<InformationSourceFormValues> => {
  const diff: Partial<InformationSourceFormValues> = {};
  if (values.name !== (source.name ?? "").trim()) diff.name = values.name;
  if (values.type !== source.type) diff.type = values.type;
  return diff;
};
