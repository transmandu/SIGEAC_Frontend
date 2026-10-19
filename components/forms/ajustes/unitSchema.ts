import type { Unit } from "@/types";
import { z } from "zod";

const same = (a: string, b: string) =>
  a.trim().toUpperCase() === b.trim().toUpperCase();

/** El símbolo distingue mayúsculas: `m` y `M`, `mL` y `ML` son unidades distintas. */
const sameSymbol = (a: string, b: string) => a.trim() === b.trim();

/**
 * Esquema del formulario de unidades. El nombre no puede repetirse (sin
 * distinguir mayúsculas) ni el símbolo (distinguiéndolas); al editar se ignora la
 * propia. El servidor repite la regla, esto solo la adelanta.
 */
export const buildUnitSchema = (units: Unit[] | undefined, ignoreId?: number) =>
  z.object({
    label: z
      .string()
      .trim()
      .min(1, { message: "Ingrese el nombre de la unidad." })
      .min(3, { message: "El nombre debe tener al menos 3 caracteres." })
      .max(255, { message: "El nombre no puede superar los 255 caracteres." })
      .refine(
        (label) =>
          !(units ?? []).some(
            (unit) => unit.id !== ignoreId && same(unit.label, label),
          ),
        { message: "Ya existe una unidad con ese nombre." },
      ),
    value: z
      .string()
      .trim()
      .min(1, { message: "Ingrese el símbolo de la unidad." })
      .max(50, { message: "El símbolo no puede superar los 50 caracteres." })
      .refine(
        (value) =>
          !(units ?? []).some(
            (unit) => unit.id !== ignoreId && sameSymbol(unit.value, value),
          ),
        { message: "Ya existe una unidad con ese símbolo." },
      ),
    is_dimensional: z.boolean(),
  });

export type UnitFormValues = z.infer<ReturnType<typeof buildUnitSchema>>;

export const UNIT_FIELD_LABELS = {
  label: "Nombre",
  value: "Símbolo",
  is_dimensional: "Declara medidas",
};

/** Solo lo que el usuario cambió respecto a la unidad guardada. */
export const diffUnit = (
  unit: Pick<Unit, "label" | "value" | "is_dimensional">,
  values: UnitFormValues,
): Partial<UnitFormValues> => {
  const diff: Partial<UnitFormValues> = {};
  if (!same(values.label, unit.label)) diff.label = values.label;
  if (values.value.trim() !== (unit.value ?? "").trim()) {
    diff.value = values.value;
  }
  if (values.is_dimensional !== !!unit.is_dimensional) {
    diff.is_dimensional = values.is_dimensional;
  }
  return diff;
};
