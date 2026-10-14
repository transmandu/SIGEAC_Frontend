"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { SettingsListPage } from "@/components/layout/SettingsListPage";
import { SettingsDataTable } from "@/components/tables/SettingsDataTable";
import { CreateThirdPartyDialog } from "@/components/dialogs/general/CreateThirdPartyDialog";
import { useTourContext } from "@/components/tour/TourProvider";
import { tercerosSteps } from "@/components/tour/steps/sistema/terceros";
import { getThirdPartyTypeLabel } from "@/lib/utils";
import { useGetThirdParties } from "@/hooks/general/terceros/useGetThirdParties";
import { SlidersHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { columns, THIRD_PARTY_TYPES } from "./columns";

const ThirdPartiesPage = () => {
  const {
    data: thirdParties,
    isPending,
    isError,
    refetch,
  } = useGetThirdParties();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("ALL");
  const deferredSearch = useDeferredValue(search);

  const { registerTour, unregisterTour } = useTourContext();

  useEffect(() => {
    if (thirdParties && thirdParties.length > 0) {
      registerTour("terceros", "Terceros", tercerosSteps);
    }

    return () => unregisterTour("terceros");
  }, [thirdParties, registerTour, unregisterTour]);

  const filtered = useMemo(() => {
    if (!thirdParties) return [];
    const q = deferredSearch.trim().toLowerCase();

    return thirdParties.filter((item) => {
      if (type !== "ALL" && item.type !== type) return false;
      if (!q) return true;

      return (
        item.name?.toLowerCase().includes(q) ||
        getThirdPartyTypeLabel(item.type)?.toLowerCase().includes(q)
      );
    });
  }, [thirdParties, deferredSearch, type]);

  return (
    <SettingsListPage
      title="Terceros"
      heading="Control de Terceros"
      description="Administra los terceros registrados en el sistema."
      tourPrefix="terceros"
      search={{
        value: search,
        onChange: setSearch,
        placeholder: "Buscar terceros...",
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
              {THIRD_PARTY_TYPES.map((value) => (
                <SelectItem key={value} value={value}>
                  {getThirdPartyTypeLabel(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
      count={{
        value: thirdParties ? filtered.length : undefined,
        singular: "tercero",
        plural: "terceros",
      }}
    >
      <SettingsDataTable
        columns={columns}
        data={filtered}
        loading={isPending}
        error={isError}
        errorMessage="No se pudieron cargar los terceros"
        onRetry={() => refetch()}
        filtered={!!deferredSearch.trim() || type !== "ALL"}
        emptyMessage="No se han encontrado terceros."
        actions={<CreateThirdPartyDialog />}
        tourPrefix="terceros"
      />
    </SettingsListPage>
  );
};

export default ThirdPartiesPage;
