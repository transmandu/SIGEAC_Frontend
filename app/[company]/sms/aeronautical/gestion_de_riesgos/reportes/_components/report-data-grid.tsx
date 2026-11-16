"use client";

import { cn } from "@/lib/utils";

import {
  DetailItem,
  hasDetailValue,
} from "@/app/[company]/sms/aeronautical/gestion_de_riesgos/_components/report-helpers";

type ReportDataGridProps = {
  items: DetailItem[];
  className?: string;
};

type DataGroup = {
  name?: string;
  items: DetailItem[];
};

const groupItems = (items: DetailItem[]): DataGroup[] =>
  items.reduce<DataGroup[]>((groups, item) => {
    const last = groups[groups.length - 1];

    if (!last || last.name !== item.group) {
      groups.push({ name: item.group, items: [item] });
    } else {
      last.items.push(item);
    }

    return groups;
  }, []);

/**
 * Datos de solo lectura: etiqueta pequeña + valor, sin cajas.
 * Los grupos conservan el orden en que llegan.
 */
export function ReportDataGrid({ items, className }: ReportDataGridProps) {
  const groups = groupItems(items);

  return (
    <div className="space-y-6">
      {groups.map((group, groupIndex) => (
        <section
          key={`${group.name ?? "general"}-${groupIndex}`}
          className="space-y-3"
        >
          {group.name ? (
            <h3 className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              {group.name}
            </h3>
          ) : null}

          <dl
            className={cn(
              "grid gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-3",
              className,
            )}
          >
            {group.items.map(
              ({ label, value, fullWidth, contentClassName }) => (
                <div
                  key={label}
                  className={cn(
                    "min-w-0",
                    fullWidth && "sm:col-span-2 xl:col-span-3",
                  )}
                >
                  <dt className="text-[11px] font-medium tracking-wider text-muted-foreground/80 uppercase">
                    {label}
                  </dt>
                  <dd
                    className={cn(
                      "mt-1 text-sm leading-6",
                      !hasDetailValue(value) && "text-muted-foreground",
                      contentClassName,
                    )}
                  >
                    {hasDetailValue(value)
                      ? value
                      : "Sin información registrada"}
                  </dd>
                </div>
              ),
            )}
          </dl>
        </section>
      ))}
    </div>
  );
}
