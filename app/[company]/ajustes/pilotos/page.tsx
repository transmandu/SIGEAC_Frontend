"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { SettingsListPage } from "@/components/layout/SettingsListPage";
import { SettingsDataTable } from "@/components/tables/SettingsDataTable";
import CreatePilotDialog from "@/components/dialogs/ajustes/CreatePilotDialog";
import { useGetPilots } from "@/hooks/sms/useGetPilots";
import { useCompanyStore } from "@/stores/CompanyStore";
import { columns } from "./columns";

const PilotsPage = () => {
  const { selectedCompany } = useCompanyStore();
  const {
    data: pilots,
    isPending,
    isError,
    refetch,
  } = useGetPilots(selectedCompany?.slug);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const filtered = useMemo(() => {
    if (!pilots) return [];
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return pilots;

    return pilots.filter(
      (pilot) =>
        pilot.employee_dni?.toLowerCase().includes(q) ||
        pilot.license_number?.toLowerCase().includes(q) ||
        pilot.employee?.first_name?.toLowerCase().includes(q) ||
        pilot.employee?.last_name?.toLowerCase().includes(q),
    );
  }, [pilots, deferredSearch]);

  return (
    <SettingsListPage
      title="Pilotos"
      heading="Control de Pilotos"
      description="Administra los pilotos de la empresa y sus números de licencia."
      search={{
        value: search,
        onChange: setSearch,
        placeholder: "Buscar pilotos...",
      }}
      count={{
        value: pilots ? filtered.length : undefined,
        singular: "piloto",
        plural: "pilotos",
      }}
    >
      <SettingsDataTable
        columns={columns}
        data={filtered}
        error={isError}
        errorMessage="No se pudieron cargar los pilotos"
        onRetry={() => refetch()}
        filtered={!!deferredSearch.trim()}
        loading={isPending}
        emptyMessage="No se han encontrado pilotos."
        actions={<CreatePilotDialog />}
      />
    </SettingsListPage>
  );
};

export default PilotsPage;
