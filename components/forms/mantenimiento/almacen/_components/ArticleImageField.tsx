"use client";

import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon, X } from "lucide-react";

import { FormDescription, FormItem, FormLabel } from "@/components/ui/form";
import { cn } from "@/lib/utils";

import { fieldClass, hintClass, labelClass } from "./form-theme";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB, el mismo tope que valida el backend.
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

/**
 * Imagen del artículo: un solo control para los 12 formularios de artículo por
 * lote, en reemplazo de las tres variantes de `FileField` que convivían.
 *
 * Valida tipo y tamaño en el cliente porque el backend rechazaba el archivo
 * recién en el submit, con un error que no decía el motivo.
 */
export const ArticleImageField = ({
    value,
    onChange,
    currentImageUrl,
    disabled,
    label = "Imagen del artículo",
}: {
    value?: File;
    onChange: (file?: File) => void;
    /** Imagen ya guardada, al editar. */
    currentImageUrl?: string | null;
    disabled?: boolean;
    label?: string;
}) => {
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // El URL se crea y se revoca dentro del mismo efecto: con useMemo, el doble
    // montaje de StrictMode revocaba el blob de la primera pasada y la
    // miniatura quedaba rota.
    useEffect(() => {
        if (!value) {
            setPreview(null);
            return;
        }

        const url = URL.createObjectURL(value);
        setPreview(url);

        return () => URL.revokeObjectURL(url);
    }, [value]);

    // El archivo recién elegido tiene prioridad sobre la imagen ya guardada.
    const shownImage = preview ?? currentImageUrl ?? null;

    const handleChange = (file?: File) => {
        if (!file) {
            onChange(undefined);
            setError(null);
            if (inputRef.current) inputRef.current.value = "";
            return;
        }

        // Se limpia el input al rechazar: si no, reelegir el mismo archivo
        // corregido no dispararía onChange.
        const reject = (message: string) => {
            onChange(undefined);
            setError(message);
            if (inputRef.current) inputRef.current.value = "";
        };

        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
            reject("Formato no válido. Use JPG, PNG o WEBP.");
            return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            reject("La imagen no debe superar los 5MB.");
            return;
        }

        setError(null);
        onChange(file);
    };

    return (
        <FormItem>
            <FormLabel className={labelClass}>{label}</FormLabel>
            {/* Input nativo oculto: en una celda estrecha el control por
                defecto desborda con el nombre del archivo. */}
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg, image/png, image/webp"
                disabled={disabled}
                onChange={(e) => handleChange(e.target.files?.[0])}
                className="hidden"
            />
            <div
                role="button"
                tabIndex={disabled ? -1 : 0}
                onClick={() => !disabled && inputRef.current?.click()}
                onKeyDown={(e) => {
                    if (disabled) return;
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        inputRef.current?.click();
                    }
                }}
                onDragOver={(e) => {
                    if (disabled) return;
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                    if (disabled) return;
                    e.preventDefault();
                    setIsDragging(false);
                    handleChange(e.dataTransfer.files?.[0]);
                }}
                className={cn(
                    fieldClass,
                    "flex w-full items-center gap-2 px-3",
                    disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                    "focus-visible:border-blue-400/60 focus-visible:outline-none",
                    isDragging && "border-primary bg-primary/5",
                    error && "border-destructive",
                )}
            >
                {shownImage ? (
                    // Miniatura de 24px que suele ser un blob local del archivo
                    // recién elegido; next/image no puede optimizar blobs, así
                    // que aquí <img> es lo correcto.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={shownImage}
                        alt="Imagen del artículo"
                        className="h-6 w-6 shrink-0 rounded-sm object-cover"
                    />
                ) : (
                    <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <span
                    className={cn(
                        "truncate",
                        value ? "text-foreground" : "text-muted-foreground",
                    )}
                >
                    {value
                        ? value.name
                        : shownImage
                            ? "Cambiar imagen"
                            : "Subir imagen"}
                </span>

                {/* Quitar solo aplica al archivo nuevo: la imagen ya guardada
                    se reemplaza, no se borra desde aquí. */}
                {value && !disabled && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleChange(undefined);
                        }}
                        className="ml-auto shrink-0 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label="Quitar imagen"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>
            <FormDescription className={hintClass}>
                Opcional. JPG, PNG o WEBP. Máx. 5MB.
            </FormDescription>
            {/* Mismo estilo que FormMessage, que aquí no aplica: el archivo no
                es un campo validado por react-hook-form. */}
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        </FormItem>
    );
};
