"use client";

import { useMemo } from "react";
import GroupedEmpty from "@/app/[company]/compras/_components/GroupedEmpty";
import RequisitionGroupRow from "./RequisitionGroupRow";
import GroupPagination from "@/components/misc/GroupPagination";
import type { Requisition } from "@/types/purchase/requisition";
import { useResettingState } from "@/hooks/useResettingState";

type Props = {
  isLoading?: boolean;
  isError?: boolean;
  data: Requisition[];
  renderTable: (rows: Requisition[]) => React.ReactNode;
};

type Group = {
  key: string;
  rows: Requisition[];
};

const PAGE_SIZE = 15;

const formatGroupLabel = (value?: string | null) => {
  if (!value || value.trim() === "") return "Sin solicitante";
  return value;
};

const GroupedRequisitionTable = ({ isLoading, isError, data, renderTable }: Props) => {
  const groups = useMemo<Group[]>(() => {
    const groupedMap = new Map<string, Requisition[]>();

    for (const item of data) {
      const key = item.requested_by?.trim() || "Sin solicitante";

      if (!groupedMap.has(key)) {
        groupedMap.set(key, []);
      }

      groupedMap.get(key)!.push(item);
    }

    return Array.from(groupedMap.entries()).map(([key, rows]) => ({
      key,
      rows,
    }));
  }, [data]);

  // Cambiar los datos (o la agrupación) devuelve la tabla a la primera página
  // con todos los grupos cerrados.
  const [pagination, setPagination] = useResettingState(
    { pageIndex: 0, pageSize: PAGE_SIZE },
    [data],
  );

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(groups.length / PAGE_SIZE));
  }, [groups.length]);

  const paginatedGroups = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    return groups.slice(start, start + pagination.pageSize);
  }, [groups, pagination]);

  const [expanded, setExpanded] = useResettingState<Record<string, boolean>>(
    {},
    [data],
  );

  const toggleGroup = (key: string) => {
    setExpanded((prev) => ({
      ...prev,
      [key]: !(prev[key] ?? false),
    }));
  };

  if (!groups.length) {
    return (
      <GroupedEmpty
        subject="requisiciones"
        isLoading={isLoading}
        isError={isError}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {paginatedGroups.map((group) => {
        const isOpen = expanded[group.key] ?? false;

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
            <RequisitionGroupRow
              title={formatGroupLabel(group.key)}
              count={group.rows.length}
              expanded={isOpen}
              onToggle={() => toggleGroup(group.key)}
            />

            {isOpen && (
              <div className="p-2 md:p-3">{renderTable(group.rows)}</div>
            )}
          </div>
        );
      })}

      <GroupPagination
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        pageCount={totalPages}
        onPageChange={(page: number) =>
          setPagination((prev) => ({
            ...prev,
            pageIndex: page,
          }))
        }
        onPageSizeChange={(size: number) =>
          setPagination({
            pageIndex: 0,
            pageSize: size,
          })
        }
        totalGroups={groups.length}
      />
    </div>
  );
};

export default GroupedRequisitionTable;
