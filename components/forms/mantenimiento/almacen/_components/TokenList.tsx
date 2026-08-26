"use client";

import { X } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Valores ya agregados a un campo de entrada múltiple, cada uno quitable.
 *
 * Vive aparte de `MultiInputField` porque los seriales lo comparten: ambos
 * campos acumulan valores y deben verse igual, aunque cada uno los capture a
 * su manera.
 */
export const TokenList = ({
    values,
    onRemove,
    disabled,
    /** Numera cada valor: útil cuando el orden identifica la unidad. */
    numbered = false,
    className,
}: {
    values: string[];
    onRemove: (index: number) => void;
    disabled?: boolean;
    numbered?: boolean;
    className?: string;
}) => {
    if (values.length === 0) return null;

    return (
        <div className={cn("flex flex-wrap gap-1.5", className)}>
            {values.map((value, index) => (
                <span
                    key={`${value}-${index}`}
                    className={cn(
                        "inline-flex max-w-full items-center gap-1.5 rounded-md py-1 pl-2.5 pr-1",
                        "border border-slate-400/50 bg-background/70 dark:border-slate-600/50",
                        "text-[13px] tabular-nums shadow-sm",
                    )}
                >
                    {numbered && (
                        <span className="text-[11px] font-medium text-muted-foreground">
                            {index + 1}
                        </span>
                    )}
                    <span className="truncate font-medium">{value}</span>
                    {!disabled && (
                        <button
                            type="button"
                            onClick={() => onRemove(index)}
                            aria-label={`Quitar ${value}`}
                            className={cn(
                                "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded",
                                "text-muted-foreground transition-colors",
                                "hover:bg-destructive/10 hover:text-destructive",
                            )}
                        >
                            <X className="h-3 w-3" />
                        </button>
                    )}
                </span>
            ))}
        </div>
    );
};
