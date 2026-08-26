"use client";

import { Boxes, Droplets, Package, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { labelClass, selectTriggerClass } from "../_components/form-theme";

export const ARTICLE_CATEGORIES = [
    { value: "COMPONENT", label: "Componente", icon: Boxes },
    { value: "PART", label: "Parte", icon: Package },
    { value: "CONSUMABLE", label: "Consumible", icon: Droplets },
    { value: "TOOL", label: "Herramienta", icon: Wrench },
    { value: "GENERAL", label: "General", icon: Package },
] as const;

export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number]["value"];

/**
 * Elige el tipo de artículo a registrar.
 *
 * Es un desplegable y no una fila de opciones a propósito: la fila se leía como
 * pestañas y hacía pensar que se podían llenar todos los formularios a la vez.
 * Con un solo valor visible queda claro que el formulario de abajo es el de esa
 * categoría y nada más.
 */
export const ArticleCategoryPicker = ({
    value,
    onChange,
    options = ARTICLE_CATEGORIES,
    disabled,
    label = "Tipo de artículo a registrar",
}: {
    value: string;
    onChange: (value: string) => void;
    options?: readonly { value: string; label: string; icon: LucideIcon }[];
    disabled?: boolean;
    label?: string;
}) => {
    const selected = options.find((option) => option.value === value);

    return (
        <div className="w-full space-y-1.5 sm:max-w-xs">
            <label className={labelClass}>{label}</label>
            <Select value={value} onValueChange={onChange} disabled={disabled}>
                <SelectTrigger
                    aria-label={label}
                    className={cn(selectTriggerClass, "w-full")}
                >
                    <SelectValue>
                        {selected && (
                            <span className="flex items-center gap-2">
                                <selected.icon className="h-4 w-4 shrink-0 text-primary" />
                                {selected.label}
                            </span>
                        )}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            <span className="flex items-center gap-2">
                                <option.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                {option.label}
                            </span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};
