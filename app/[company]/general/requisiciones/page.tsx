"use client";

import { motion } from "motion/react";
import { useMemo } from "react";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";

import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetMyRequisitions } from "@/hooks/general/requisiciones/useGetMyRequisitions";
import type {
  MyRequisitionStatusFilter,
  MyRequisitionTypeFilter,
} from "@/hooks/general/requisiciones/useGetMyRequisitions";
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
    statusFilter,
    setStatusFilter,
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

  const statusTabs: {
    value: MyRequisitionStatusFilter;
    label: string;
    dot: string;
  }[] = [
    { value: "ALL", label: "Todos", dot: "bg-foreground/40" },
    { value: "CREATED", label: "Creada", dot: "bg-slate-500" },
    { value: "RECEIVED", label: "Recibida", dot: "bg-sky-500" },
    { value: "IN_PROGRESS", label: "En proceso", dot: "bg-yellow-500" },
    { value: "QUOTED", label: "Cotizada", dot: "bg-amber-600" },
    { value: "APPROVED", label: "Aprobada", dot: "bg-emerald-500" },
    { value: "REJECTED", label: "No aprobada", dot: "bg-red-500" },
  ];

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

        <div className="flex flex-col gap-y-1.5">
          <div className="flex items-center justify-center gap-x-3 rounded-lg border border-border bg-muted/40 p-1.5">
            {tabs.map(({ value, label, count }) => {
              const active = typeFilter === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTypeFilter(value)}
                  className={cn(
                    "relative rounded-md border px-4 py-1 text-xs font-medium transition-colors active:scale-95",
                    active
                      ? "border-transparent text-foreground"
                      : "border-border/60 bg-background/40 text-muted-foreground hover:bg-background/70",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="requisition-type-pill"
                      className="absolute inset-0 rounded-md border border-border bg-background shadow-sm"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 36,
                      }}
                    />
                  )}
                  <span className="relative">
                    {label}
                    <span className="ml-1.5 inline-block min-w-[3ch] rounded bg-muted px-1 text-center text-[10px] font-semibold tabular-nums">
                      {count}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-lg border border-border/60 bg-muted/20 p-1">
            {statusTabs.map(({ value, label, dot }) => {
              const active = statusFilter === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatusFilter(value)}
                  className={cn(
                    "relative flex items-center gap-x-1.5 rounded-full border px-3 py-1 text-[11px] font-medium transition-colors active:scale-95",
                    active
                      ? "border-transparent text-foreground"
                      : "border-border/40 text-muted-foreground hover:bg-background/60 hover:text-foreground",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="requisition-status-pill"
                      className="absolute inset-0 rounded-full border border-border bg-background shadow-sm"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 36,
                      }}
                    />
                  )}
                  <span
                    className={cn(
                      "relative h-1.5 w-1.5 rounded-full transition-transform duration-200",
                      dot,
                      active && "scale-125",
                    )}
                  />
                  <span className="relative">{label}</span>
                </button>
              );
            })}
          </div>
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
