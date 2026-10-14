"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { SettingsListPage } from "@/components/layout/SettingsListPage";
import { SettingsDataTable } from "@/components/tables/SettingsDataTable";
import { CreateRetailerDialog } from "@/components/dialogs/mantenimiento/compras/CreateRetailerDialog";
import { useGetRetailers } from "@/hooks/general/comercios/useGetRetailers";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useTourContext } from "@/components/tour/TourProvider";
import { comerciosSteps } from "@/components/tour/steps/ajustes/comercios";
import { columns } from "./columns";

const RetailersPage = () => {
  const { selectedCompany } = useCompanyStore();
  const {
    data: retailers,
    isPending,
    isError,
    refetch,
  } = useGetRetailers(selectedCompany?.slug);
  const { registerTour, unregisterTour } = useTourContext();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    if (retailers && retailers.length > 0) {
      registerTour("comercios", "Comercios", comerciosSteps);
    }

    return () => unregisterTour("comercios");
  }, [registerTour, unregisterTour, retailers]);

  const filtered = useMemo(() => {
    if (!retailers) return [];
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return retailers;

    return retailers.filter(
      (r) =>
        r.name?.toLowerCase().includes(q) ||
        r.phone?.toLowerCase().includes(q) ||
        r.address?.toLowerCase().includes(q),
    );
  }, [retailers, deferredSearch]);

  return (
    <SettingsListPage
      title="Comercios"
      heading="Control de Comercios"
      description="Administra los comercios y lugares de compra (tiendas físicas o en línea) donde se adquieren los artículos generales."
      tourPrefix="comercios"
      search={{
        value: search,
        onChange: setSearch,
        placeholder: "Buscar comercios...",
      }}
      count={{
        value: retailers ? filtered.length : undefined,
        singular: "comercio",
        plural: "comercios",
      }}
    >
      <SettingsDataTable
        columns={columns}
        data={filtered}
        error={isError}
        errorMessage="No se pudieron cargar los comercios"
        onRetry={() => refetch()}
        filtered={!!deferredSearch.trim()}
        loading={isPending}
        emptyMessage="No se han encontrado comercios."
        actions={<CreateRetailerDialog />}
        tourPrefix="comercios"
      />
    </SettingsListPage>
  );
};

export default RetailersPage;
