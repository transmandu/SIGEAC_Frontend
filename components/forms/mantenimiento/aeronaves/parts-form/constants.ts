import { Control, FieldValues, useWatch } from "react-hook-form";

/** Partes principales: nombran a la parte ("Motor 1") y exigen TSN y CSN. */
export const MAIN_PART_TYPES = ["MOTOR", "TURBINA", "HELICE", "APU"];

/** Sugerencias para las subpartes; el tipo de una subparte también se puede escribir. */
export const COMPONENT_PART_TYPES = [
  "GENERADOR",
  "ARRANCADOR",
  "CAJA DE ENGRANES",
  "BOMBA",
  "GOBERNADOR",
  "SECCION CALIENTE",
  "ACCESORIO",
];

/** De las principales, la hélice solo cuenta horas. */
export const countsCycles = (type?: string | null) =>
  isMainPartType(type) &&
  String(type ?? "")
    .trim()
    .toUpperCase() !== "HELICE";

export const POSITION_TYPES = [
  { label: "Left Hand (LH)", value: "LH" },
  { label: "Right Hand (RH)", value: "RH" },
];

export const isMainPartType = (type?: string | null) =>
  MAIN_PART_TYPES.includes(
    String(type ?? "")
      .trim()
      .toUpperCase(),
  );

export const usePartValue = <T, TForm extends FieldValues = FieldValues>(
  control: Control<TForm>,
  path: string,
  defaultValue?: T,
): T => {
  return useWatch({
    // El hook lee rutas armadas en runtime (`parts.0.sub_parts`), así que el
    // tipo del formulario no aporta nada aquí y sus genéricos no encajan.
    control: control as unknown as Control<FieldValues>,
    name: path,
    defaultValue,
  }) as unknown as T;
};
