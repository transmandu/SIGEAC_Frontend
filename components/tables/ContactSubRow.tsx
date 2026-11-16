import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ContactSubRowItem {
  icon: LucideIcon;
  label: string;
  value?: ReactNode;
}

/**
 * Subfila de una tabla de ajustes con los datos de contacto que la fila no
 * muestra (teléfono, correo, dirección). Ocupa todo el ancho: las columnas se
 * reparten el espacio, así no queda un hueco a la derecha. Sin ningún dato
 * dice que no hay, en vez de pintar un panel de rayas.
 */
export function ContactSubRow({ items }: { items: ContactSubRowItem[] }) {
  if (items.every((item) => !item.value)) {
    return (
      <p className="py-1 text-[13px] text-muted-foreground">
        Sin información adicional.
      </p>
    );
  }

  return (
    <dl
      className={cn(
        "grid gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-700/60 dark:bg-slate-900/40",
        items.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2",
      )}
    >
      {items.map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Icon className="size-4" />
          </span>
          <div className="min-w-0">
            <dt className="text-[13px] text-muted-foreground">{label}</dt>
            <dd className="text-sm font-medium wrap-anywhere text-foreground max-sm:text-base">
              {value || "—"}
            </dd>
          </div>
        </div>
      ))}
    </dl>
  );
}
