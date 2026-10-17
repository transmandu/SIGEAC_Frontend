"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { SettingsListPage } from "@/components/layout/SettingsListPage";
import { SettingsDataTable } from "@/components/tables/SettingsDataTable";
import { CreateClientDialog } from "@/components/dialogs/mantenimiento/clientes/CreateClientDialog";
import { useGetClients } from "@/hooks/mantenimiento/clientes/useGetClients";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useTourContext } from "@/components/tour/TourProvider";
import { clientesSteps } from "@/components/tour/steps/ajustes/clientes/clientes";
import { columns } from "./aeronautical-columns";
import { phoneMatches } from "@/lib/phone";

export function AeronauticalClientsView() {
  const { selectedCompany } = useCompanyStore();
  const {
    data: clients,
    isPending,
    isError,
    refetch,
  } = useGetClients(selectedCompany?.slug);
  const { registerTour, unregisterTour } = useTourContext();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    if (clients && clients.length > 0) {
      registerTour("clientes", "Clientes", clientesSteps);
    }
    return () => unregisterTour("clientes");
  }, [registerTour, unregisterTour, clients]);

  const filtered = useMemo(() => {
    if (!clients) return [];
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return clients;

    return clients.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.dni?.toLowerCase().includes(q) ||
        phoneMatches(c.phone, q) ||
        c.address?.toLowerCase().includes(q),
    );
  }, [clients, deferredSearch]);

  return (
    <SettingsListPage
      title="Clientes"
      heading="Control de Clientes"
      description="Administra los clientes registrados en el sistema."
      tourPrefix="clientes"
      search={{
        value: search,
        onChange: setSearch,
        placeholder: "Buscar clientes...",
      }}
      count={{
        value: clients ? filtered.length : undefined,
        singular: "cliente",
        plural: "clientes",
      }}
    >
      <SettingsDataTable
        columns={columns}
        data={filtered}
        error={isError}
        errorMessage="No se pudieron cargar los clientes"
        onRetry={() => refetch()}
        filtered={!!deferredSearch.trim()}
        loading={isPending}
        emptyMessage="No se han encontrado clientes."
        actions={<CreateClientDialog />}
        tourPrefix="clientes"
      />
    </SettingsListPage>
  );
}
