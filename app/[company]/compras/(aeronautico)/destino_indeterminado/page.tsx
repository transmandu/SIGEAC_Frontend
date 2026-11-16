"use client";

import { useDeferredValue, useMemo, useState } from "react";

import { ContentLayout } from "@/components/layout/ContentLayout";

import { useCompanyStore } from "@/stores/CompanyStore";
import { useToDeterminateQueue } from "@/hooks/mantenimiento/almacen/inventario/useArticleQueues";

import { DataTable } from "@/app/[company]/compras/data-table";
import { columns } from "./columns";

import UnknownDestinationToolbar from "./_components/UnknownDestinationToolbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { toAltPartNumbers } from "@/lib/utils";
import {
  PurchasesHeading,
  PurchasesToolbar,
} from "@/app/[company]/compras/_components/PurchasesPageParts";

export default function UnknownDestinationPage() {
  const { selectedCompany } = useCompanyStore();

  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const { data: articles = [], isLoading, isError } = useToDeterminateQueue();

  /**
   * 🔥 Loading pattern unificado
   */

  const filteredArticles = useMemo(() => {
    if (!articles) return [];

    if (!deferredSearch.trim()) return articles;

    const q = deferredSearch.toLowerCase();

    // La descripción de un aeronáutico es el nombre de su renglón.
    return articles.filter((article) =>
      [
        article.part_number,
        ...toAltPartNumbers(article.alternative_part_number),
        article.serial,
        article.batch?.category,
        article.batch?.name,
        article.manufacturer?.name,
      ].some((value) => value?.toLowerCase().includes(q)),
    );
  }, [articles, deferredSearch]);

  return (
    <ContentLayout title="Destino indeterminado">
      <div className="flex flex-col gap-6">
        {/* Breadcrumb */}
        <PageHeader />

        {/* Header */}
        <PurchasesHeading
          heading="Destino indeterminado"
          description="Artículos pendientes de confirmación de destino dentro del sistema logístico."
        />

        {/* Toolbar */}
        <PurchasesToolbar>
          <UnknownDestinationToolbar search={search} setSearch={setSearch} />

          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {filteredArticles.length}{" "}
            {filteredArticles.length === 1 ? "artículo" : "artículos"}
          </span>
        </PurchasesToolbar>

        {/* TABLE / LOADING SPLIT */}
        <DataTable
          error={isError}
          columns={columns}
          data={filteredArticles}
          loading={isLoading}
          loadingText="Cargando artículos..."
          emptyText="No se encontraron artículos"
          persistKey="destino_indeterminado"
        />

        {/* Error */}
      </div>
    </ContentLayout>
  );
}
