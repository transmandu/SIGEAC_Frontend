"use client";

import { useMemo, useState } from "react";
import GroupRow from "./GroupRow";
import { CursorPagination } from "@/components/tables/CursorPagination";
import type { CursorPaginationState } from "@/hooks/helpers/useCursorListing";

type GroupableRow = {
  id: number;
  group_key?: string;
  _groupIndex?: number;
  _groupRows?: GroupableRow[];
};

type Props<T extends GroupableRow> = {
  data: T[];
  renderTable: (rows: T[]) => React.ReactNode;
  pagination: CursorPaginationState & { summary?: string };
  isTransitioning?: boolean;
};

type Group<T> = {
  key: string;
  rows: T[];
};

const formatGroupLabel = (value?: string | null) => {
  if (!value || value.trim() === "") return "Sin valor";
  return value;
};

/**
 * Tabla agrupada de la gestión de costos.
 *
 * El servidor agrupa y pagina por grupos completos: las filas de un grupo
 * llegan contiguas y todas en la misma página, así que aquí solo se reúnen.
 * Que el grupo esté completo es lo que permite "replicar costo" a todas sus
 * filas sin perder las que estarían en otra página.
 */
const GroupedCostTable = <T extends GroupableRow>({
  data,
  renderTable,
  pagination,
  isTransitioning = false,
}: Props<T>) => {
  const groups = useMemo<Group<T>[]>(() => {
    const result: Group<T>[] = [];

    for (const item of data) {
      const key = item.group_key ?? "";
      const last = result[result.length - 1];

      // La base agrupa sin distinguir mayúsculas: la clave se compara igual.
      if (last && last.key.toUpperCase() === key.toUpperCase()) {
        last.rows.push(item);
      } else {
        result.push({ key, rows: [item] });
      }
    }

    return result;
  }, [data]);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleGroup = (key: string) => {
    setExpanded((prev) => ({
      ...prev,
      [key]: !(prev[key] ?? false),
    }));
  };

  if (!groups.length) {
    return (
      <div
        className="
        rounded-xl border
        bg-white dark:bg-slate-900/60
        border-slate-200 dark:border-slate-700/60
        px-6 py-10
        text-center
      "
      >
        <p className="text-sm text-muted-foreground">
          No hay datos agrupados disponibles.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        className={`flex flex-col gap-4 transition-opacity ${isTransitioning ? "opacity-50 pointer-events-none" : ""}`}
      >
        {groups.map((group) => {
          const isOpen = expanded[group.key] ?? false;

          const enrichedRows = group.rows.map((r, idx) => ({
            ...r,
            _groupIndex: idx,
            _groupRows: group.rows,
          }));

          return (
            <div
              key={group.key}
              className="
                overflow-visible
                rounded-2xl border
                border-slate-200/80
                dark:border-slate-700/60
                bg-white/90
                dark:bg-slate-900/60
                backdrop-blur-md
                shadow-xs
                dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)]
              "
            >
              <GroupRow
                title={formatGroupLabel(group.key)}
                count={group.rows.length}
                expanded={isOpen}
                onToggle={() => toggleGroup(group.key)}
              />

              {isOpen && (
                <div className="p-2 md:p-3">{renderTable(enrichedRows)}</div>
              )}
            </div>
          );
        })}
      </div>

      <CursorPagination {...pagination} />
    </div>
  );
};

export default GroupedCostTable;
