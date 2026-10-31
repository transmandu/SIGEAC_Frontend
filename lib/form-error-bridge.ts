import type { UseFormReturn } from "react-hook-form";

import type { FieldLabels } from "@/components/forms/mantenimiento/almacen/_components/form-feedback";

interface ActiveForm {
  // Los campos son de cualquier formulario: aquí solo importan sus nombres.
  setError: UseFormReturn<any>["setError"];
  getValues: UseFormReturn<any>["getValues"];
}

/**
 * Formularios montados, el más reciente al final. Los registra `<Form>`, así que
 * cualquier formulario hecho con react-hook-form participa sin tocar su código.
 *
 * Existe porque quien recibe el 422 es la mutación, que no sabe qué formulario
 * la originó; sin esto, solo los formularios que cablearon `onFieldErrors` a
 * mano marcaban el campo rechazado y el resto se quedaba en el aviso.
 */
const mounted: ActiveForm[] = [];

export const registerActiveForm = (form: ActiveForm): (() => void) => {
  mounted.push(form);

  return () => {
    const index = mounted.lastIndexOf(form);
    if (index >= 0) mounted.splice(index, 1);
  };
};

const rootOf = (field: string) => field.split(".")[0];

/**
 * Nombres que casi nunca son un input sino el registro sobre el que actuó la
 * petición (`errors.id` al borrar algo desde una tabla). Con un formulario
 * abierto al lado, coincidir en ellos no prueba que el error sea suyo.
 */
const RECORD_KEYS = new Set(["id"]);

/**
 * El formulario abierto más reciente que tiene alguno de los campos que el
 * servidor rechazó. Exigir coincidencia evita marcar un formulario ajeno cuando
 * falla una acción cualquiera de la pantalla (una tabla, una barra de botones).
 */
export const findFormForErrors = (
  fieldErrors: Record<string, string[]>,
): { setError: ActiveForm["setError"]; labels: FieldLabels } | null => {
  const rejected = new Set(
    Object.keys(fieldErrors)
      .map(rootOf)
      .filter((name) => !RECORD_KEYS.has(name)),
  );

  for (let i = mounted.length - 1; i >= 0; i--) {
    const form = mounted[i];

    let known: string[];
    try {
      known = Object.keys(form.getValues() ?? {});
    } catch {
      continue;
    }

    const shared = known.filter((name) => rejected.has(name));
    if (shared.length === 0) continue;

    return {
      setError: form.setError,
      labels: Object.fromEntries(shared.map((name) => [name, name])),
    };
  }

  return null;
};
