"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { SettingsListPage } from "@/components/layout/SettingsListPage";
import { SettingsDataTable } from "@/components/tables/SettingsDataTable";
import CreateLocationDialog from "@/components/dialogs/ajustes/CreateLocationDialog";
import { useIsSuperuser } from "@/hooks/helpers/useIsSuperuser";
import { useGetLocationsByCompany } from "@/hooks/sistema/useGetLocationsByCompany";
import { useCompanyStore } from "@/stores/CompanyStore";
import { getColumns } from "./columns";

const LocationsPage = () => {
  const { selectedCompany } = useCompanyStore();
  const canManage = useIsSuperuser();
  const {
    data: locations,
    isPending,
    isError,
    refetch,
  } = useGetLocationsByCompany(selectedCompany?.slug);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const columns = useMemo(() => getColumns(canManage), [canManage]);

  const filtered = useMemo(() => {
    if (!locations) return [];
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return locations;

    return locations.filter(
      (location) =>
        location.address?.toLowerCase().includes(q) ||
        location.name?.toLowerCase().includes(q) ||
        location.cod_iata?.toLowerCase().includes(q) ||
        (location.isMainBase ? "principal" : "alterna").includes(q),
    );
  }, [locations, deferredSearch]);

  return (
    <SettingsListPage
      title="Ubicaciones"
      heading="Control de Ubicaciones"
      description={
        canManage
          ? "Administre las sedes de la empresa: su ciudad, nombre, código IATA y cuál es la base principal."
          : "Consulte las sedes registradas para la empresa en el sistema."
      }
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
        actions={canManage ? <CreateLocationDialog /> : undefined}
      />
    </SettingsListPage>
  );
};

export default LocationsPage;
