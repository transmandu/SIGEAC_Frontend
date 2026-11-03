import type { ComponentType, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: "muted" | "error";
  className?: string;
}

/**
 * Estado vacío o de error de tablas y listados: recuadro de icono, título y,
 * si hace falta, una acción. Un solo molde para que "sin datos", "sin
 * coincidencias" y "falló la carga" se vean igual en todo el sistema.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  tone = "muted",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 text-center",
        className,
      )}
    >
      <div
        className={
          tone === "error"
            ? "flex size-11 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 text-red-500"
            : "flex size-11 items-center justify-center rounded-2xl border border-border/60 bg-muted/40 text-muted-foreground"
        }
      >
        <Icon className="size-5" />
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && (
        <p className="max-w-sm text-xs text-muted-foreground">{description}</p>
      )}
      {action}
    </div>
  );
}
