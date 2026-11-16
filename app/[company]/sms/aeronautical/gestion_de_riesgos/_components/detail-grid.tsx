import { cn } from "@/lib/utils";

import { DetailItem, hasDetailValue } from "./report-helpers";

export function DetailGrid({ items }: { items: DetailItem[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map(({ label, value, fullWidth, contentClassName }) => (
        <div
          key={label}
          className={cn(
            "rounded-lg border border-border/60 bg-muted/20 p-4 transition-colors hover:bg-muted/30",
            fullWidth && "sm:col-span-2 xl:col-span-3",
          )}
        >
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
            {label}
          </p>
          <div
            className={cn(
              "mt-1.5 text-sm leading-6",
              !hasDetailValue(value) && "text-muted-foreground",
              contentClassName,
            )}
          >
            {hasDetailValue(value) ? value : "Sin informacion registrada"}
          </div>
        </div>
      ))}
    </div>
  );
}
