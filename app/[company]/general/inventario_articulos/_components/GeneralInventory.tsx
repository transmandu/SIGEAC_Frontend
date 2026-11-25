"use client";

import {
  generalConsultaColumns,
  groupedConsulta,
} from "@/components/tables/GeneralArticleConsultaColumns";
import { useCompanyInventoryGeneralArticles } from "@/hooks/mantenimiento/almacen/inventario/useCompanyInventoryGeneralArticles";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import type { CompanyInventoryGeneralArticle } from "@/types/inventory";
import { GeneralArticleIndividualsViewDialog } from "@/app/[company]/general/inventario_articulos/_components/GeneralArticleIndividualsViewDialog";
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
  const [selected, setSelected] =
    useState<CompanyInventoryGeneralArticle | null>(null);
  const [open, setOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-12 animate-spin text-primary" />
      </div>
    );
  }

  // Solo la fila agrupada tiene detalle que abrir; las demás no tienen nada
  // más que mostrar y las funciones de edición viven en el almacén.
  return (
    <>
      <DataTable
        columns={generalConsultaColumns}
        data={rows}
        isFetching={isFetching}
        onRowClick={(row) => {
          if (!groupedConsulta(row)) return;
          setSelected(row);
          setOpen(true);
        }}
        rowClassName={(row) =>
          groupedConsulta(row) ? "cursor-pointer hover:bg-muted/30" : ""
        }
        pagination={{
          ...pagination,
          summary:
            total !== undefined
              ? `${total.toLocaleString("es-VE")} artículo(s)`
              : undefined,
        }}
      />
      <GeneralArticleIndividualsViewDialog
        open={open}
        onOpenChange={setOpen}
        articleId={selected?.id ?? null}
        description={selected?.description ?? ""}
        unit={selected?.unit?.value ?? selected?.unit?.label}
      />
    </>
  );
}
