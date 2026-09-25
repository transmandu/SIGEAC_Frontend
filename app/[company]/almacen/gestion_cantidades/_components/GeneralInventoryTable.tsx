"use client";

import React, { useMemo } from "react";
import { useTable } from "@tanstack/react-table";
import { appTableFeatures } from "@/lib/table";

import type { CursorPaginationState } from "@/hooks/helpers/useCursorListing";
import type { WarehouseInventoryGeneralArticle } from "@/types/inventory";
import { GeneralInventoryToolbar } from "./GeneralInventoryToolbar";
import { GeneralInventoryDataTable } from "./GeneralInventoryDataTable";
import { buildGeneralInventoryColumns } from "./columnts";

type Props = {
  articles: WarehouseInventoryGeneralArticle[];
  search: string;
  onSearchChange: (value: string) => void;
  total?: number;
  isFetching: boolean;
  pagination: CursorPaginationState;
  baseQuantities: Record<number, number>;
  editedQuantities: Record<number, number | undefined>;
  onQuantityChange: (id: number, value: string) => void;
  onSave: () => void;
  isSaving: boolean;
  hasChanges: boolean;
  modifiedCount: number;
};

/**
 * La búsqueda y la paginación las resuelve el servidor: aquí no se filtra ni
 * se ordena la página, que es solo una parte del inventario.
 */
export function GeneralInventoryTable({
  articles,
  search,
  onSearchChange,
  total,
  isFetching,
  pagination,
  baseQuantities,
  editedQuantities,
  onQuantityChange,
  onSave,
  isSaving,
  hasChanges,
  modifiedCount,
}: Props) {
  const columns = useMemo(
    () =>
      buildGeneralInventoryColumns({
        baseQuantities,
        editedQuantities,
        onQuantityChange,
      }),
    [baseQuantities, editedQuantities, onQuantityChange],
  );

  const table = useTable({
    features: appTableFeatures,
    data: articles,
    columns,
    manualSorting: true,
    initialState: {
      pagination: { pageIndex: 0, pageSize: 100 },
    },
  });

  return (
    <div className="flex flex-col gap-3">
      <GeneralInventoryToolbar
        search={search}
        onSearchChange={onSearchChange}
        total={total}
        modifiedCount={modifiedCount}
        hasChanges={hasChanges}
        onSave={onSave}
        isSaving={isSaving}
      />
      <GeneralInventoryDataTable
        table={table}
        colSpan={columns.length}
        isFetching={isFetching}
        pagination={{
          ...pagination,
          summary:
            total !== undefined
              ? `${total.toLocaleString("es-VE")} artículo(s)`
              : undefined,
        }}
      />
    </div>
  );
}
