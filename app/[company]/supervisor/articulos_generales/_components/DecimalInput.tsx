"use client"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/**
 * Campo decimal de texto plano.
 *
 * Es <input type="text"> a propósito, no type="number": este último trae las
 * flechas de incremento, cambia el valor con la rueda del ratón sobre el campo
 * y acepta notación científica ("1e5") — todo indeseable para capturar una
 * equivalencia de conversión.
 *
 * Filtra la entrada a dígitos con punto como separador decimal: descarta
 * cualquier otro carácter y no permite un segundo punto. Se mantiene como
 * string (no number) para que el usuario pueda escribir "1." mientras teclea
 * sin que el valor se normalice bajo sus dedos.
 */
export function DecimalInput({
    value,
    onValueChange,
    className,
    ...props
}: Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "type"> & {
    value: string
    onValueChange: (value: string) => void
}) {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const raw = event.target.value

        if (raw === "") {
            onValueChange("")
            return
        }

        // La coma es el separador decimal habitual al teclear en español: se
        // acepta y se traduce a punto en vez de descartarla.
        const normalized = raw.replace(/,/g, ".")

        // Solo dígitos y un único punto, en cualquier posición válida.
        if (!/^\d*\.?\d*$/.test(normalized)) return

        onValueChange(normalized)
    }

    return (
        <Input
            {...props}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={value}
            onChange={handleChange}
            className={cn("tabular-nums", className)}
        />
    )
}
