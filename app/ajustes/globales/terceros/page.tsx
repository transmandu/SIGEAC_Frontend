"use client";

import { useMemo, useState, useDeferredValue, useEffect } from "react";
import { ContentLayout } from "@/components/layout/ContentLayout";
import BackButton from "@/components/misc/BackButton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetThirdParties } from "@/hooks/general/terceros/useGetThirdParties";
import { getThirdPartyTypeLabel } from "@/lib/utils";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useTourContext } from "@/components/tour/TourProvider";
import { tercerosSteps } from "@/components/tour/steps/ajustes/globales/terceros";

const ThirdPartiesPage = () => {
  const { selectedCompany } = useCompanyStore();
  const { data: thirdParties, isLoading, isError } = useGetThirdParties();
  const [search, setSearch] = useState("");
  const { registerTour, unregisterTour } = useTourContext();

  useEffect(() => {
    if (thirdParties && thirdParties.length > 0) {
      registerTour("terceros", "Terceros", tercerosSteps);
    }

    return () => unregisterTour("terceros");
  }, [thirdParties, registerTour, unregisterTour]);

  const deferredSearch = useDeferredValue(search);

  const filteredThirdParties = useMemo(() => {
    if (!thirdParties) return [];

    const q = deferredSearch.toLowerCase();

    return thirdParties.filter((thirdParty) => {
      const matchesSearch =
        !deferredSearch.trim() ||
        thirdParty.name?.toLowerCase()?.includes(q) ||
        getThirdPartyTypeLabel(thirdParty.type)?.toLowerCase()?.includes(q);

      return matchesSearch;
    });
  }, [thirdParties, deferredSearch]);

  return (
    <ContentLayout title="Terceros">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <BackButton iconOnly tooltip="Volver" variant="secondary" />

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/${selectedCompany?.slug}/dashboard`}>
                  Inicio
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbSeparator />

              <BreadcrumbItem>Ajustes</BreadcrumbItem>

              <BreadcrumbSeparator />

              <BreadcrumbItem>
                <BreadcrumbPage>Terceros</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div
          className="flex flex-col gap-2 border-b pb-4"
          data-tour="terceros-title"
        >
          <h1 className="text-3xl font-semibold tracking-tight">
            Control de Terceros
          </h1>

          <p className="text-sm text-muted-foreground">
            Administra los terceros registrados en el sistema.
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 px-3 py-2 rounded-xl border bg-slate-200/40 border-slate-200/40 dark:bg-slate-800/70 dark:border-slate-700/60 backdrop-blur-md dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
          <div className="relative w-64 sm:w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />

            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar terceros..."
              className="
                pl-8 h-8 text-xs
                bg-white/80 dark:bg-slate-900/60
                border-slate-200/60
                dark:border-slate-700/60
                focus-visible:ring-1
                focus-visible:ring-[#439A97]/40
              "
            />
          </div>

          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {filteredThirdParties.length}{" "}
            {filteredThirdParties.length === 1 ? "tercero" : "terceros"}
          </span>
        </div>

        <DataTable
          columns={columns}
          data={filteredThirdParties}
          loading={isLoading}
        />

        {isError && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
            <p className="text-sm text-red-500">
              Ha ocurrido un error al cargar los terceros.
            </p>
          </div>
        )}
      </div>
    </ContentLayout>
  );
};

export default ThirdPartiesPage;
