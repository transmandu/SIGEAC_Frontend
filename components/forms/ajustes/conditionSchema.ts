import { Condition } from "@/types";
import { z } from "zod";

/**
 * Esquema del formulario de condiciones. El nombre no puede repetirse entre
 * condiciones (sin distinguir mayúsculas); al editar se ignora la propia.
 */
export const buildConditionSchema = (
  conditions: Condition[] | undefined,
  ignoreId?: number,
) =>
  z.object({
    name: z
      .string()
      .min(3, { message: "El nombre debe tener al menos 3 caracteres." })
      .refine(
        (name) => {
          const normalized = name.trim().toUpperCase();
          return !(conditions ?? []).some(
            (condition) =>
              condition.id !== ignoreId &&
              condition.name.trim().toUpperCase() === normalized,
          );
        },
        { message: "Esta condición ya existe. Use un nombre diferente." },
      ),
    description: z
      .string()
      .min(2, { message: "La descripción debe tener al menos 2 caracteres." }),
    excluded_from_cost: z.boolean(),
  });

export type ConditionFormValues = z.infer<
  ReturnType<typeof buildConditionSchema>
>;
