"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { SettingsListPage } from "@/components/layout/SettingsListPage";
import { SettingsDataTable } from "@/components/tables/SettingsDataTable";
import { useGetLocationsByCompany } from "@/hooks/sistema/useGetLocationsByCompany";
import { useCompanyStore } from "@/stores/CompanyStore";
import { columns } from "./columns";

const LocationsPage = () => {
  const { selectedCompany } = useCompanyStore();
  const {
    data: locations,
    isPending,
    isError,
    refetch,
  } = useGetLocationsByCompany(selectedCompany?.slug);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const filtered = useMemo(() => {
    if (!locations) return [];
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return locations;

    return locations.filter(
      (location) =>
        location.name?.toLowerCase().includes(q) ||
        location.address?.toLowerCase().includes(q) ||
        location.cod_iata?.toLowerCase().includes(q) ||
        location.type?.toLowerCase().includes(q),
    );
  }, [locations, deferredSearch]);

  return (
    <SettingsListPage
      title="Ubicaciones"
      heading="Control de Ubicaciones"
      description="Consulta las ubicaciones registradas para la empresa en el sistema."
      search={{
        value: search,
        onChange: setSearch,
        placeholder: "Buscar ubicaciones...",
      }}
      count={{
        value: locations ? filtered.length : undefined,
        singular: "ubicación",
        plural: "ubicaciones",
      }}
    >
      <SettingsDataTable
        columns={columns}
        data={filtered}
        loading={isPending}
        error={isError}
        errorMessage="No se pudieron cargar las ubicaciones"
        onRetry={() => refetch()}
        filtered={!!deferredSearch.trim()}
        emptyMessage="No se han encontrado ubicaciones."
      />
    </SettingsListPage>
  );
};

export default LocationsPage;
