"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { TokenList } from "../../_components/TokenList";
import { fieldClass, hintClass } from "../../_components/form-theme";

interface MultiSerialInputProps {
    values: string[];
    onChange: (values: string[]) => void;
    disabled?: boolean;
    placeholder?: string;
    /** Al editar sólo existe un artículo: no se acumulan seriales. */
    single?: boolean;
}

/**
 * Seriales del ingreso, uno por unidad a registrar.
 *
 * Se comporta igual que los números de parte alternos —escribir, Enter,
 * insignia quitable— porque el usuario necesita ver la lista de unidades que va
 * a crear, no un contador que le obligue a abrir un diálogo para revisarla.
 */
export function MultiSerialInput({
    values = [],
    onChange,
    disabled = false,
    placeholder = "Ej: 05458E1",
    single = false,
}: MultiSerialInputProps) {
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef<HTMLInputElement | null>(null);

    const addSerial = () => {
        const serial = inputValue.trim().toUpperCase();
        if (!serial) return;

        if (single) {
            onChange([serial]);
        } else if (!values.includes(serial)) {
            onChange([...values, serial]);
        }

        setInputValue("");
        inputRef.current?.focus();
    };

    const removeSerial = (index: number) => {
        onChange(values.filter((_, i) => i !== index));
        inputRef.current?.focus();
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (disabled) return;

        if (event.key === "Enter" && inputValue.trim()) {
            event.preventDefault();
            addSerial();
            return;
        }

        if (event.key === "Backspace" && !inputValue && values.length) {
            event.preventDefault();
            removeSerial(values.length - 1);
        }
    };

    // Al pegar una columna de seriales se agregan todos de una vez: es la forma
    // en que llegan desde un remito o una hoja de cálculo.
    const handlePaste: React.ClipboardEventHandler<HTMLInputElement> = (event) => {
        if (single) return;

        const pasted = event.clipboardData
            .getData("text")
            .split(/[,;\n\t]/)
            .map((serial) => serial.trim().toUpperCase())
            .filter(Boolean);

        if (pasted.length <= 1) return;

        event.preventDefault();
        const next = [...values];
        for (const serial of pasted) {
            if (!next.includes(serial)) next.push(serial);
        }
        onChange(next);
    };

    const atSingleLimit = single && values.length > 0;

    return (
        <div className="w-full space-y-2">
            <div className="flex gap-2">
                <Input
                    ref={inputRef}
                    value={inputValue}
                    disabled={disabled || atSingleLimit}
                    onChange={(event) => setInputValue(event.target.value)}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    placeholder={placeholder}
                    className={cn(fieldClass, "flex-1")}
                />
                <Button
                    type="button"
                    variant="outline"
                    onClick={addSerial}
                    disabled={disabled || atSingleLimit || !inputValue.trim()}
                    className={cn(fieldClass, "shrink-0 px-4")}
                >
                    Agregar
                </Button>
            </div>

            <TokenList
                values={values}
                onRemove={removeSerial}
                disabled={disabled}
                numbered={!single}
            />

            <p className={hintClass}>
                {single
                    ? values.length === 0
                        ? "Escriba el serial y presione Enter."
                        : "Quite el serial para reemplazarlo."
                    : values.length === 0
                      ? "Escriba y presione Enter. Se registra un artículo por serial."
                      : `${values.length} unidad${values.length === 1 ? "" : "es"} a registrar.`}
            </p>
        </div>
    );
}
