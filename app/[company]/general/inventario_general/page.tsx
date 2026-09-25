"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/helpers/useDebounce";
import { useCompanyInventoryGeneralArticles } from "@/hooks/mantenimiento/almacen/inventario/useCompanyInventoryGeneralArticles";
import { Loader2, X } from "lucide-react";
import { useState } from "react";
import { DataTable } from "@/app/[company]/general/inventario_articulos/data-table";
import { generalConsultaColumns } from "@/components/tables/GeneralArticleConsultaColumns";
import { PageHeader } from "@/components/layout/PageHeader";

const InventarioGeneralPage = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 400);

  const { rows, total, isLoading, isFetching, pagination } =
    useCompanyInventoryGeneralArticles(debouncedSearch || undefined);

  return (
    <ContentLayout title="Inventario General">
      <div className="flex flex-col gap-y-4">
        <PageHeader className="mb-2" />

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Inventario General</h1>
          <p className="text-sm text-muted-foreground italic">
            Consulta de artículos generales / ferretería
          </p>
        </div>

        <div className="relative max-w-xl mx-auto w-full">
          <Input
            placeholder="Búsqueda General - Buscar por descripción, marca o presentación"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-8 h-11"
          />
          {search && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => setSearch("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="size-12 animate-spin text-primary" />
          </div>
        ) : (
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
        )}
      </div>
    </ContentLayout>
  );
};

export default InventarioGeneralPage;
