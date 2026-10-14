import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type TagTone =
  | "blue"
  | "sky"
  | "violet"
  | "emerald"
  | "green"
  | "orange"
  | "amber"
  | "rose"
  | "slate";

// Clases completas y estáticas: Tailwind no ve las que se arman por partes.
const TONES: Record<TagTone, string> = {
  blue: "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  sky: "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  violet:
    "border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  emerald:
    "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  green:
    "border-green-500/25 bg-green-500/10 text-green-700 dark:text-green-300",
  orange:
    "border-orange-500/25 bg-orange-500/10 text-orange-700 dark:text-orange-300",
  amber:
    "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  rose: "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  slate:
    "border-slate-500/25 bg-slate-500/10 text-slate-700 dark:text-slate-300",
};

interface TagBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: TagTone;
  icon?: LucideIcon;
}

/**
 * Etiqueta de tipo/estado de las tablas de ajustes. Un solo tamaño, peso y
 * altura para todas; lo único que cambia entre una y otra es el tono.
 */
export const TagBadge = React.forwardRef<HTMLSpanElement, TagBadgeProps>(
  function TagBadge(
    { tone = "slate", icon: Icon, className, children, ...props },
    ref,
  ) {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex h-6 w-fit cursor-default select-none items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 text-xs font-medium leading-none",
          TONES[tone],
          className,
        )}
        {...props}
      >
        {Icon && <Icon className="size-3 shrink-0" />}
        {children}
      </span>
    );
  },
);
