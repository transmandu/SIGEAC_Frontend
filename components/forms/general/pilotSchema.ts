import type { Pilot } from "@/types";
import { z } from "zod";

const same = (a?: string | null, b?: string | null) =>
  (a ?? "").trim().toUpperCase() === (b ?? "").trim().toUpperCase();

/**
 * Esquema del formulario de pilotos. La licencia no puede repetirse entre
 * pilotos (sin distinguir mayúsculas); al editar se ignora la propia. El
 * servidor repite la regla, esto solo la adelanta.
 */
export const buildPilotSchema = (
  pilots: Pilot[] | undefined,
  ignoreId?: Pilot["id"],
) =>
  z.object({
    employee_dni: z.string().min(1, "Seleccione un empleado."),
    license_number: z
      .string()
      .trim()
      .min(1, "Ingrese el número de licencia.")
      .min(3, "La licencia debe tener al menos 3 caracteres.")
      .max(255, "La licencia no puede superar los 255 caracteres.")
      .refine(
        (license) =>
          !(pilots ?? []).some(
            (pilot) =>
              pilot.id !== ignoreId && same(pilot.license_number, license),
          ),
        { message: "Ya existe un piloto con ese número de licencia." },
      ),
  });

export type PilotFormValues = z.infer<ReturnType<typeof buildPilotSchema>>;

export const PILOT_FIELD_LABELS = {
  employee_dni: "Empleado",
  license_number: "Número de licencia",
};

/** Solo lo que el usuario cambió respecto al piloto guardado. */
export const diffPilot = (
  pilot: Pick<Pilot, "license_number">,
  values: PilotFormValues,
): { license_number?: string } => {
  const diff: { license_number?: string } = {};
  if (!same(values.license_number, pilot.license_number)) {
    diff.license_number = values.license_number;
  }
  return diff;
};
