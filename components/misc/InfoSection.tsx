"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

/**
 * Bloque de la ficha, con el mismo cristal y encabezado que las secciones de
 * los formularios de artículo: es la misma información y se estaba viendo con
 * un lenguaje visual propio que no se parecía a nada más del módulo.
 */
export function InfoSection({
  icon: Icon,
  title,
  hint,
  tone = "default",
  children,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
  tone?: "default" | "alert";
  children: React.ReactNode;
}) {
  const alert = tone === "alert";

  return (
    <section
      className={cn(
        "rounded-xl border bg-linear-to-br p-4 shadow-xs backdrop-blur-md",
        alert
          ? "border-orange-300 from-orange-50/80 to-orange-50/40 dark:border-orange-700/60 dark:from-orange-950/40 dark:to-orange-950/20"
          : "border-slate-400/50 from-background/70 to-background/40 dark:border-slate-600/50",
      )}
    >
      <div className={cn("flex gap-3", hint ? "items-start" : "items-center")}>
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            hint && "mt-0.5",
            alert ? "bg-orange-600 text-white" : "bg-primary/10 text-primary",
          )}
        >
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <h3
            className={cn(
              "text-sm font-semibold leading-none",
              alert && "text-orange-900 dark:text-orange-200",
            )}
          >
            {title}
          </h3>
          {hint && (
            <p
              className={cn(
                "text-xs",
                alert
                  ? "text-orange-900/80 dark:text-orange-200/80"
                  : "text-muted-foreground",
              )}
            >
              {hint}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4">{children}</div>
    </section>
  );
}
