"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { useGetConditions } from "@/hooks/general/condiciones/useGetConditions";
import { useTourContext } from "@/components/tour/TourProvider";
import { condicionesSteps } from "@/components/tour/steps/ajustes/condiciones";
import { columns } from "./columns";
import { DataTable } from "./data-table";

const ConditionsPage = () => {
  const { data: conditions, isLoading, isError } = useGetConditions();
  const [search, setSearch] = useState("");
  const { registerTour, unregisterTour } = useTourContext();

  useEffect(() => {
    if (conditions && conditions.length > 0) {
      registerTour("condiciones", "Condiciones", condicionesSteps);
    }

    return () => unregisterTour("condiciones");
  }, [conditions, registerTour, unregisterTour]);

  const deferredSearch = useDeferredValue(search);

  const filteredConditions = useMemo(() => {
    if (!conditions) return [];

    const q = deferredSearch.trim().toLowerCase();
    if (!q) return conditions;

    return conditions.filter(
      (condition) =>
        condition.name?.toLowerCase().includes(q) ||
        condition.description?.toLowerCase().includes(q),
    );
  }, [conditions, deferredSearch]);

  return (
    <ContentLayout title="Condiciones">
      <div className="flex flex-col gap-6">
        <PageHeader />

        <div
          className="flex flex-col gap-2 border-b pb-4"
          data-tour="condiciones-title"
        >
          <h1 className="text-3xl font-semibold tracking-tight">
            Control de Condiciones
          </h1>

          <p className="text-sm text-muted-foreground">
            Administra las condiciones de los artículos del almacén y cuáles no
            cuentan como gasto en los reportes.
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 px-3 py-2 rounded-xl border bg-slate-200/40 border-slate-200/40 dark:bg-slate-800/70 dark:border-slate-700/60 backdrop-blur-md dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
          <div className="relative w-64 sm:w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />

            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar condiciones..."
              className="
                pl-8 h-8 text-xs
                bg-white/80 dark:bg-slate-900/60
                border-slate-200/60
                dark:border-slate-700/60
                focus-visible:ring-1
                focus-visible:ring-primary/40
              "
            />
          </div>

          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {filteredConditions.length}{" "}
            {filteredConditions.length === 1 ? "condición" : "condiciones"}
          </span>
        </div>

        <DataTable
          columns={columns}
          data={filteredConditions}
          loading={isLoading}
        />

        {isError && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
            <p className="text-sm text-red-500">
              Ha ocurrido un error al cargar las condiciones.
            </p>
          </div>
        )}
      </div>
    </ContentLayout>
  );
};

export default ConditionsPage;
