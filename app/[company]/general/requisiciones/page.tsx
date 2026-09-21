"use client";

import { useMemo } from "react";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";

import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetMyRequisitions } from "@/hooks/general/requisiciones/useGetMyRequisitions";
import type { MyRequisitionTypeFilter } from "@/hooks/general/requisiciones/useGetMyRequisitions";
import { useCompanyTimezone } from "@/hooks/general/useCompanyTimezone";
import { cn } from "@/lib/utils";

import { getColumns } from "./columns";
import { DataTable } from "./data-table";

const RequisitionsPage = () => {
  const { selectedCompany } = useCompanyStore();
  const timeZone = useCompanyTimezone();

  /**
   * El alcance —todas las solicitudes, las de almacén o solo las propias— lo
   * resuelve el servidor según el rol de quien consulta. Antes se decidía aquí,
   * sobre una respuesta que ya traía las solicitudes de todos.
   */
  const {
    data: requisitions,
    counts,
    isLoading,
    isError,
    isFetching,
    isTransitioning,
    refetch,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
    pageIndex,
    pageSize,
    setPageSize,
  } = useGetMyRequisitions();

  const columns = useMemo(
    () => getColumns(selectedCompany ?? undefined, timeZone),
    [selectedCompany, timeZone],
  );

  const tabs = useMemo(
    () =>
      [
        { value: "ALL", label: "Todas", count: counts.all },
        {
          value: "AERONAUTICAL",
          label: "Aeronáutica",
          count: counts.aeronautical,
        },
        { value: "GENERAL", label: "General", count: counts.general },
      ] as { value: MyRequisitionTypeFilter; label: string; count: number }[],
    [counts],
  );

  return (
    <ContentLayout title="Solicitudes de Compra">
      <div className="flex flex-col gap-y-2">
        <PageHeader className="mb-4" />

        <h1 className="text-4xl font-bold text-center">
          Solicitudes de Compra
        </h1>

        <p className="text-sm text-muted-foreground text-center italic">
          Aquí puede observar todas las solicitudes de compra generales.
          <br />
          Filtre y/o busque si desea una en específico.
        </p>

        <div className="flex rounded-md border border-border overflow-hidden w-fit">
          {tabs.map(({ value, label, count }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTypeFilter(value)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium transition-colors border-r last:border-r-0",
                typeFilter === value
                  ? "bg-muted text-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted/50",
              )}
            >
              {label}
              <span
                className={cn(
                  "ml-1.5 px-1 py-0 rounded text-[10px] font-semibold tabular-nums",
                  typeFilter === value ? "bg-background/60" : "bg-muted",
                )}
              >
                {count}
              </span>
            </button>
          ))}
        </div>

        <DataTable
          columns={columns}
          data={requisitions ?? []}
          search={search}
          onSearchChange={setSearch}
          isFetching={isFetching}
          loading={isLoading}
          isTransitioning={isTransitioning}
          isError={isError}
          onRetry={() => refetch()}
          onNextPage={nextPage}
          onPrevPage={prevPage}
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
        />
      </div>
    </ContentLayout>
  );
};

export default RequisitionsPage;
