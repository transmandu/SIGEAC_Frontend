import { Control, FieldValues, useWatch } from "react-hook-form";

export const PART_TYPES = [
    "MOTOR",
    "TURBINA",
    "HELICE",
    "APU",
];

export const POSITION_TYPES = [
    { label: "Left Hand (LH)", value: "LH" },
    { label: "Right Hand (RH)", value: "RH" },
];

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
