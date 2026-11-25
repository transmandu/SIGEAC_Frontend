import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const SIZE = {
  /** Opción de una elección única, a la altura de un campo. */
  field: "h-10 gap-2 rounded-lg px-2 text-sm max-sm:text-base",
  /** Opción de una elección múltiple, compacta. */
  chip: "h-8 rounded-md px-2.5 text-xs max-sm:h-10 max-sm:text-sm",
} as const;

/**
 * Opción de una elección dentro de un formulario (tipo de destino, etapas):
 * el mismo botón con su estado marcado, para que ninguna pantalla lo reinvente.
 * Quien lo usa pone el rol (`radio` o un `aria-pressed`) según la elección.
 */
export function ChoiceButton({
  selected,
  size,
  className,
  children,
  ...props
}: {
  selected: boolean;
  size: keyof typeof SIZE;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "flex items-center justify-center border font-medium transition-colors",
        SIZE[size],
        selected
          ? "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300"
          : "border-slate-300/70 bg-background text-slate-600 hover:bg-muted/50 dark:border-slate-600/60 dark:text-slate-300",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
