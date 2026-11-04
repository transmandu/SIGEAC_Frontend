"use client";

import { generalConsultaColumns } from "@/components/tables/GeneralArticleConsultaColumns";
import { useCompanyInventoryGeneralArticles } from "@/hooks/mantenimiento/almacen/inventario/useCompanyInventoryGeneralArticles";
import { Loader2 } from "lucide-react";
import { DataTable } from "@/app/[company]/general/inventario_articulos/_tables/data-table";

interface Props {
  /** Búsqueda ya con debounce. */
  search?: string;
  /** Solo consulta mientras su tab está a la vista. */
  active: boolean;
}

/** Artículos generales / ferretería vistos desde fuera del almacén. */
export function GeneralInventory({ search, active }: Props) {
  const { rows, total, isLoading, isFetching, pagination } =
    useCompanyInventoryGeneralArticles(search, active);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DataTable
      columns={generalConsultaColumns}
      data={rows}
      isFetching={isFetching}
      pagination={{
        ...pagination,
        summary:
          total !== undefined
            ? `${total.toLocaleString("es-VE")} artículo(s)`
            : undefined,
      }}
    />
  );
}
