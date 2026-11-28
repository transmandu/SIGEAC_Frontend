"use client";

import { memo } from "react";
import { Clock, Star, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type QuickAccess = "favorites" | "recents";

const ITEMS: { key: QuickAccess; label: string; icon: LucideIcon }[] = [
  { key: "favorites", label: "Favoritos", icon: Star },
  { key: "recents", label: "Recientes", icon: Clock },
];

interface QuickAccessNavProps {
  value: QuickAccess | null;
  onChange: (value: QuickAccess) => void;
  counts: Record<QuickAccess, number>;
}

/**
 * Accesos rápidos encima del árbol de carpetas: lo que el usuario marcó como
 * favorito y lo último que abrió, de todos los departamentos que ve.
 */
function QuickAccessNav({ value, onChange, counts }: QuickAccessNavProps) {
  return (
    <nav
      aria-label="Accesos rápidos"
      className="mb-2 space-y-0.5 border-b border-border/60 pb-2"
      data-tour="biblioteca-accesos-rapidos"
    >
      {ITEMS.map(({ key, label, icon: Icon }) => {
        const active = value === key;

        return (
          <button
            key={key}
            type="button"
            aria-current={active ? "page" : undefined}
            onClick={() => onChange(key)}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm font-medium outline-hidden motion-safe:transition-colors focus-visible:ring-2 focus-visible:ring-primary/30 max-md:py-2.5",
              active
                ? "bg-primary/10 font-semibold text-primary"
                : "text-slate-700 hover:bg-muted/60 dark:text-slate-300",
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="flex-1 truncate">{label}</span>
            {counts[key] > 0 && (
              <span className="text-xs tabular-nums text-slate-600 dark:text-slate-400">
                {counts[key]}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

export default memo(QuickAccessNav);
