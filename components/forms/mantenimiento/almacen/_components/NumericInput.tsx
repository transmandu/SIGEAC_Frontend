"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { numericFieldClass, onlyInteger, onlyNumeric } from "./form-theme";

/**
 * Campo numérico que respeta lo que el usuario está escribiendo.
 *
 * El patrón anterior normalizaba a número en cada tecla y devolvía ese número
 * al `value` del input, así que el texto tecleado nunca sobrevivía intacto:
 *
 *  - Vaciar el campo emitía `undefined`, y cualquier re-render que reaplicara
 *    los `defaultValues` volvía a pintar el valor anterior. Por eso un 5 no se
 *    dejaba borrar mientras que "55 → 5" sí funcionaba: con dos dígitos el
 *    valor nunca pasaba por vacío.
 *  - Un "5." se convertía a 5 en el acto, de modo que no se podía teclear un
 *    decimal de corrido.
 *
 * Aquí el texto es el estado mientras el campo tiene el foco, y hacia el
 * formulario solo viaja el número. Al salir del foco se re-sincroniza con el
 * valor del formulario, que es el que manda.
 */
export interface NumericInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
    value: number | string | null | undefined;
    /** Recibe `undefined` cuando el campo queda vacío, nunca una cadena. */
    onValueChange: (value: number | undefined) => void;
    /** Sin decimales: cantidades que se cuentan en piezas enteras. */
    integerOnly?: boolean;
}

/**
 * Variante para los campos cuyo formulario guarda el número como texto.
 *
 * Emite la cadena ya saneada en vez de un número, de modo que el payload sigue
 * viajando igual que antes; lo que gana es no repintar lo que se escribe.
 */
export interface NumericTextInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
    value: string | number | null | undefined;
    onValueChange: (value: string) => void;
    integerOnly?: boolean;
}

export const NumericTextInput = React.forwardRef<HTMLInputElement, NumericTextInputProps>(
    ({ value, onValueChange, integerOnly, className, inputMode, ...props }, ref) => {
        const sanitize = integerOnly ? onlyInteger : onlyNumeric;

        return (
            <Input
                {...props}
                ref={ref}
                inputMode={inputMode ?? (integerOnly ? "numeric" : "decimal")}
                className={cn(numericFieldClass, className)}
                value={value ?? ""}
                onChange={(event) => onValueChange(sanitize(event.target.value))}
            />
        );
    },
);

NumericTextInput.displayName = "NumericTextInput";

/**
 * Texto que representa al valor del formulario cuando el campo no tiene foco.
 * Un `NaN` se muestra vacío: llegar a pintar "NaN" en el campo sería peor que
 * no mostrar nada.
 */
const displayValue = (value: number | string | null | undefined) => {
    if (value === null || value === undefined || value === "") return "";

    return typeof value === "number" && Number.isNaN(value) ? "" : String(value);
};

/** El valor de fuera, como número o `undefined`; nunca `NaN`. */
const toNumber = (value: number | string | null | undefined) => {
    if (value === null || value === undefined || value === "") return undefined;

    const parsed = typeof value === "string" ? Number.parseFloat(value) : value;

    return Number.isNaN(parsed) ? undefined : parsed;
};

export const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
    ({ value, onValueChange, integerOnly, className, inputMode, onBlur, onFocus, ...props }, ref) => {
        /**
         * Lo que el usuario tiene escrito.
         *
         * Manda sobre `value` porque es más reciente: react-hook-form repone su
         * `defaultValue` en cuanto el campo vale `undefined`, así que al borrar
         * el número el valor viejo volvía a pintarse solo. Ese era el bug del
         * campo que "no se dejaba borrar" — con dos dígitos no aparecía, porque
         * el valor nunca llegaba a quedar vacío.
         */
        const [draft, setDraft] = React.useState<string | null>(null);

        // Lo último que emitió este campo, para distinguir el eco del propio
        // valor de un cambio venido de fuera (un reset, cargar el artículo a
        // editar), que sí debe verse. Se siembra con el valor inicial: partir
        // de `undefined` confundía "aún no se ha escrito nada" con "se vació".
        const lastEmitted = React.useRef<number | undefined>(toNumber(value));

        React.useEffect(() => {
            const incoming = toNumber(value);

            // El eco del propio valor no toca el borrador; cualquier otra cosa
            // viene de fuera (un reset, cargar el artículo a editar) y tiene que
            // verse, incluso si el usuario estaba escribiendo.
            if (incoming === lastEmitted.current) return;

            lastEmitted.current = incoming;
            setDraft(null);
        }, [value]);

        const sanitize = integerOnly ? onlyInteger : onlyNumeric;

        const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            const cleaned = sanitize(event.target.value);
            setDraft(cleaned);

            // Vacío es un valor válido en un campo opcional y debe llegar como
            // tal al formulario: es lo que permite borrar el número. "5." y "5"
            // valen lo mismo como número, pero el punto tiene que seguir en
            // pantalla para poder escribir "5.5" de corrido.
            const next = cleaned === "" ? undefined : toNumber(cleaned);

            lastEmitted.current = next;
            onValueChange(next);
        };

        return (
            <Input
                {...props}
                ref={ref}
                inputMode={inputMode ?? (integerOnly ? "numeric" : "decimal")}
                className={cn(numericFieldClass, className)}
                value={draft ?? displayValue(value)}
                onChange={handleChange}
                onFocus={(event) => {
                    setDraft(displayValue(value));
                    onFocus?.(event);
                }}
                onBlur={(event) => {
                    // El borrador se normaliza en vez de soltarse: descartarlo
                    // devolvía el mando a `value`, y react-hook-form ya habría
                    // repuesto ahí el valor anterior. Así un "5." queda escrito
                    // como 5 y un campo vaciado se queda vacío.
                    setDraft((current) => {
                        if (current === null || current === "") return current;

                        const parsed = toNumber(current);

                        return parsed === undefined ? "" : String(parsed);
                    });
                    onBlur?.(event);
                }}
            />
        );
    },
);

NumericInput.displayName = "NumericInput";
