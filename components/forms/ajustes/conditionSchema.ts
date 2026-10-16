import { Condition } from "@/types";
import { z } from "zod";

const same = (a?: string | null, b?: string | null) =>
  (a ?? "").trim().toUpperCase() === (b ?? "").trim().toUpperCase();

/**
 * Esquema del formulario de condiciones. El nombre no puede repetirse entre
 * condiciones (sin distinguir mayúsculas); al editar se ignora la propia. El
 * servidor repite la regla, esto solo la adelanta.
 */
export const buildConditionSchema = (
  conditions: Condition[] | undefined,
  ignoreId?: number,
) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(1, { message: "Ingrese el nombre de la condición." })
      .min(3, { message: "El nombre debe tener al menos 3 caracteres." })
      .max(255, { message: "El nombre no puede superar los 255 caracteres." })
      .refine(
        (name) =>
          !(conditions ?? []).some(
            (condition) =>
              condition.id !== ignoreId && same(condition.name, name),
          ),
        { message: "Ya existe una condición con ese nombre." },
      ),
    description: z
      .string()
      .trim()
      .min(1, { message: "Ingrese una descripción." })
      .min(2, { message: "La descripción debe tener al menos 2 caracteres." })
      .max(500, { message: "La descripción no puede superar los 500 caracteres." }),
    excluded_from_cost: z.boolean(),
  });

export type ConditionFormValues = z.infer<
  ReturnType<typeof buildConditionSchema>
>;

export const CONDITION_FIELD_LABELS = {
  name: "Nombre",
  description: "Descripción",
  excluded_from_cost: "No cuenta como gasto",
};

/** Solo lo que el usuario cambió respecto a la condición guardada. */
export const diffCondition = (
  condition: Pick<Condition, "name" | "description" | "excluded_from_cost">,
  values: ConditionFormValues,
): Partial<ConditionFormValues> => {
  const diff: Partial<ConditionFormValues> = {};
  if (!same(values.name, condition.name)) diff.name = values.name;
  if (values.description !== (condition.description ?? "").trim()) {
    diff.description = values.description;
  }
  if (values.excluded_from_cost !== !!condition.excluded_from_cost) {
    diff.excluded_from_cost = values.excluded_from_cost;
  }
  return diff;
};
