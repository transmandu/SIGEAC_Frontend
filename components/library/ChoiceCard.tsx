"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const TONES = {
  blue: {
    card: "border-primary/60 bg-primary/5",
    dot: "border-primary bg-primary",
    title: "text-primary",
  },
  amber: {
    card: "border-amber-500/60 bg-amber-500/5",
    dot: "border-amber-500 bg-amber-500",
    title: "text-amber-700 dark:text-amber-400",
  },
  rose: {
    card: "border-rose-500/60 bg-rose-500/5",
    dot: "border-rose-500 bg-rose-500",
    title: "text-rose-700 dark:text-rose-400",
  },
} as const;

interface ChoiceCardProps {
  selected: boolean;
  onSelect: () => void;
  icon: LucideIcon;
  title: string;
  description: string;
  tone?: keyof typeof TONES;
  tour?: string;
  /** Contenido que aparece solo con la opción elegida (un selector). */
  children?: ReactNode;
}

/**
 * Opción excluyente con su explicación (descargar la vigente o una versión,
 * borrar el documento o una versión). Es un radio: se elige con clic, Enter o
 * espacio, y lo que lleva dentro (`children`) solo se ve estando elegida.
 */
export function ChoiceCard({
  selected,
  onSelect,
  icon: Icon,
  title,
  description,
  tone = "blue",
  tour,
  children,
}: ChoiceCardProps) {
  const styles = TONES[tone];

  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      data-tour={tour}
      onClick={onSelect}
      onKeyDown={(event) => {
        // Con un selector enfocado dentro, Enter y espacio son del selector.
        if (event.target !== event.currentTarget) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "cursor-pointer rounded-xl border p-4 outline-hidden motion-safe:transition-colors focus-visible:ring-2 focus-visible:ring-primary/40",
        selected
          ? styles.card
          : "border-slate-200 bg-background hover:border-slate-300 dark:border-slate-700/60",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className={cn(
            "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border-2",
            selected ? styles.dot : "border-slate-300 dark:border-slate-600",
          )}
        >
          {selected && <span className="size-1.5 rounded-full bg-white" />}
        </span>

        <div className="min-w-0 flex-1 space-y-1">
          <p
            className={cn(
              "flex items-center gap-2 text-sm font-semibold",
              selected ? styles.title : "text-slate-700 dark:text-slate-200",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {title}
          </p>
          <p className="text-[13px] leading-snug text-muted-foreground">
            {description}
          </p>
          {selected && children && (
            <div className="pt-2" onClick={(event) => event.stopPropagation()}>
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
