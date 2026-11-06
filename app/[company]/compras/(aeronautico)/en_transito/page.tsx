"use client";

import { useState, useDeferredValue, useMemo } from "react";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { useCompanyStore } from "@/stores/CompanyStore";
import { DataTable } from "@/app/[company]/compras/data-table";
import { getColumns } from "./columns";
import TransitToolbar from "./_components/TransitToolBar";
import { useTransitArticles } from "./hooks/useTransitArticles";
import type { TransitStatusFilter } from "@/types/purchase";
import { PageHeader } from "@/components/layout/PageHeader";
import { useCompanyTimezone } from "@/hooks/general/useCompanyTimezone";
import { toAltPartNumbers } from "@/lib/utils";
import {
  PurchasesHeading,
  PurchasesToolbar,
} from "@/app/[company]/compras/_components/PurchasesPageParts";

const EnTransitoPage = () => {
  const { selectedCompany } = useCompanyStore();
  const timeZone = useCompanyTimezone();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TransitStatusFilter>("ALL");

  const deferredSearch = useDeferredValue(search);

  const { articles, totalTransit, totalReception, isLoading, isError } =
    useTransitArticles({ status });

  const filteredArticles = useMemo(() => {
    if (!articles) return [];

    if (!deferredSearch.trim()) return articles;

    const q = deferredSearch.toLowerCase();

    return articles.filter(
      (a) =>
        a.part_number?.toLowerCase().includes(q) ||
        toAltPartNumbers(a.alternative_part_number).some((alt) =>
          alt.toLowerCase().includes(q),
        ) ||
        a.batch?.name?.toLowerCase().includes(q) ||
        a.serial?.toLowerCase().includes(q) ||
        a.lot_number?.toLowerCase().includes(q) ||
        a.batch?.warehouse?.location?.address?.toLowerCase().includes(q),
    );
  }, [articles, deferredSearch]);

  const columns = useMemo(
    () => getColumns(selectedCompany ?? undefined, timeZone),
    [selectedCompany, timeZone],
  );

  return (
    <ContentLayout title="Artículos en Tránsito">
      <div className="flex flex-col gap-6">
        <PageHeader />

        <PurchasesHeading
          heading="Artículos en Tránsito"
          description="Gestione artículos en proceso de tránsito y recepción dentro del sistema logístico."
        />

        <PurchasesToolbar>
          <TransitToolbar
            search={search}
            setSearch={setSearch}
            status={status}
            setStatus={setStatus}
          />

          <span className="text-xs text-muted-foreground tabular-nums">
            {filteredArticles.length}{" "}
            {filteredArticles.length === 1 ? "artículo" : "artículos"}
          </span>
        </PurchasesToolbar>

        <DataTable
          error={isError}
          columns={columns}
          data={filteredArticles}
          loading={isLoading}
          pageSize={15}
          loadingText="Cargando artículos..."
          emptyText="No se encontraron artículos"
          persistKey="en_transito"
        />
      </div>
    </ContentLayout>
  );
};

export default EnTransitoPage;
