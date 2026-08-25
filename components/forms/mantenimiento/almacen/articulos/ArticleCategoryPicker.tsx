"use client";

import { Boxes, Droplets, Package, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

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
 * Se muestra como una fila de opciones y no como un `select`: son pocas, fijas,
 * y verlas todas evita abrir un desplegable para descubrir qué hay.
 */
export const ArticleCategoryPicker = ({
    value,
    onChange,
    options = ARTICLE_CATEGORIES,
    disabled,
}: {
    value: string;
    onChange: (value: string) => void;
    options?: readonly { value: string; label: string; icon: LucideIcon }[];
    disabled?: boolean;
}) => (
    <div role="radiogroup" aria-label="Tipo de artículo" className="flex flex-wrap gap-2">
        {options.map((option) => {
            const active = value === option.value;
            const Icon = option.icon;

            return (
                <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    disabled={disabled}
                    onClick={() => onChange(option.value)}
                    className={cn(
                        "inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium",
                        "border transition-all duration-200",
                        active
                            ? "border-primary/50 bg-primary/10 text-primary shadow-sm"
                            : "border-slate-400/60 text-muted-foreground dark:border-slate-600/60",
                        disabled
                            ? "cursor-not-allowed opacity-50"
                            : !active && "hover:border-blue-400/40 hover:text-foreground",
                    )}
                >
                    <Icon className="h-4 w-4 shrink-0" />
                    {option.label}
                </button>
            );
        })}
    </div>
);
