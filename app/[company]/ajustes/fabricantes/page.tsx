"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { SettingsListPage } from "@/components/layout/SettingsListPage";
import { SettingsDataTable } from "@/components/tables/SettingsDataTable";
import { CreateManufacturerDialog } from "@/components/dialogs/general/CreateManufacturerDialog";
import { useGetManufacturers } from "@/hooks/general/fabricantes/useGetManufacturers";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useTourContext } from "@/components/tour/TourProvider";
import { fabricantesSteps } from "@/components/tour/steps/ajustes/fabricantes";
import { SlidersHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { columns, MANUFACTURER_TYPE_LABELS } from "./columns";

const ManufacturersPage = () => {
  const { selectedCompany } = useCompanyStore();
  const {
    data: manufacturers,
    isPending,
    isError,
    refetch,
  } = useGetManufacturers(selectedCompany?.slug);
  const { registerTour, unregisterTour } = useTourContext();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("ALL");
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    if (manufacturers && manufacturers.length > 0) {
      registerTour("fabricantes", "Fabricantes", fabricantesSteps);
    }

    return () => unregisterTour("fabricantes");
  }, [registerTour, unregisterTour, manufacturers]);

  const filtered = useMemo(() => {
    if (!manufacturers) return [];
    const q = deferredSearch.trim().toLowerCase();

    return manufacturers.filter((m) => {
      if (type !== "ALL" && m.type !== type) return false;
      if (!q) return true;

      return (
        m.name?.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q) ||
        MANUFACTURER_TYPE_LABELS[m.type]?.toLowerCase().includes(q)
      );
    });
  }, [manufacturers, deferredSearch, type]);

  return (
    <SettingsListPage
      title="Fabricantes"
      heading="Control de Fabricantes"
      description="Administra los fabricantes registrados para aeronaves, partes y artículos."
      tourPrefix="fabricantes"
      search={{
        value: search,
        onChange: setSearch,
        placeholder: "Buscar fabricantes...",
      }}
      filters={
        <div className="relative">
          <SlidersHorizontal className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 z-10 size-3.5 text-muted-foreground" />
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="h-8 w-50 pl-8 text-xs bg-white/80 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-700/60 transition-colors focus:ring-1 focus:ring-primary/40">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent className="border-slate-200/60 dark:border-slate-700/60">
              <SelectItem value="ALL">Todos los tipos</SelectItem>
              {Object.entries(MANUFACTURER_TYPE_LABELS).map(
                ([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>
      }
      count={{
        value: manufacturers ? filtered.length : undefined,
        singular: "fabricante",
        plural: "fabricantes",
      }}
    >
      <SettingsDataTable
        columns={columns}
        data={filtered}
        error={isError}
        errorMessage="No se pudieron cargar los fabricantes"
        onRetry={() => refetch()}
        filtered={!!deferredSearch.trim() || type !== "ALL"}
        loading={isPending}
        emptyMessage="No se han encontrado fabricantes."
        actions={<CreateManufacturerDialog />}
        tourPrefix="fabricantes"
      />
    </SettingsListPage>
  );
};

export default ManufacturersPage;
