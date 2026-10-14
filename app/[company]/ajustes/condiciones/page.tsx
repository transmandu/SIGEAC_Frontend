"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { SettingsListPage } from "@/components/layout/SettingsListPage";
import { SettingsDataTable } from "@/components/tables/SettingsDataTable";
import { CreateConditionDialog } from "@/components/dialogs/ajustes/CreateConditionDialog";
import { useTourContext } from "@/components/tour/TourProvider";
import { condicionesSteps } from "@/components/tour/steps/ajustes/condiciones";
import { useGetConditions } from "@/hooks/general/condiciones/useGetConditions";
import { columns } from "./columns";

const ConditionsPage = () => {
  const { data: conditions, isPending, isError, refetch } = useGetConditions();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const { registerTour, unregisterTour } = useTourContext();

  useEffect(() => {
    if (conditions && conditions.length > 0) {
      registerTour("condiciones", "Condiciones", condicionesSteps);
    }

    return () => unregisterTour("condiciones");
  }, [conditions, registerTour, unregisterTour]);

  const filtered = useMemo(() => {
    if (!conditions) return [];
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return conditions;

    return conditions.filter(
      (item) =>
        item.name?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q),
    );
  }, [conditions, deferredSearch]);

  return (
    <SettingsListPage
      title="Condiciones"
      heading="Control de Condiciones"
      description="Administra las condiciones de los artículos del almacén y cuáles no cuentan como gasto en los reportes."
      tourPrefix="condiciones"
      search={{
        value: search,
        onChange: setSearch,
        placeholder: "Buscar condiciones...",
      }}
      count={{
        value: conditions ? filtered.length : undefined,
        singular: "condición",
        plural: "condiciones",
      }}
    >
      <SettingsDataTable
        columns={columns}
        data={filtered}
        loading={isPending}
        error={isError}
        errorMessage="No se pudieron cargar las condiciones"
        onRetry={() => refetch()}
        filtered={!!deferredSearch.trim()}
        emptyMessage="No se han encontrado condiciones."
        actions={<CreateConditionDialog />}
        tourPrefix="condiciones"
      />
    </SettingsListPage>
  );
};

export default ConditionsPage;
