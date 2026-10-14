"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { SettingsListPage } from "@/components/layout/SettingsListPage";
import { SettingsDataTable } from "@/components/tables/SettingsDataTable";
import { CreateShippingAgencyDialog } from "@/components/dialogs/general/CreateShippingAgencyDialog";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetShippingAgencies } from "@/hooks/general/agencias_envio/useGetShippingAgencies";
import { getColumns } from "./columns";
import { ShippingAgency } from "@/types";
import ShippingAgenciesToolBar from "./_components/ShippingAgenciesToolBar";
import ShippingAgenciesSubRow from "./_components/ShippingAgenciesSubRow";
import { useTourContext } from "@/components/tour/TourProvider";
import { agenciasEnvioSteps } from "@/components/tour/steps/ajustes/agencia-envios/agencia-envios";

const columns = getColumns();

const ShippingAgenciesPage = () => {
  const { selectedCompany } = useCompanyStore();

  const {
    data: agencies,
    isPending,
    isError,
    refetch,
  } = useGetShippingAgencies(selectedCompany?.slug);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("ALL");
  const { registerTour, unregisterTour } = useTourContext();

  useEffect(() => {
    if (agencies && agencies.length > 0) {
      registerTour("agencias-envio", "Agencias de Envío", agenciasEnvioSteps);
    }

    return () => unregisterTour("agencias-envio");
  }, [registerTour, unregisterTour, agencies]);

  const deferredSearch = useDeferredValue(search);

  const filteredAgencies = useMemo<ShippingAgency[]>(() => {
    if (!agencies) return [];
    const q = deferredSearch.trim().toLowerCase();

    return agencies.filter((agency: ShippingAgency) => {
      const matchesSearch =
        !q ||
        agency.name?.toLowerCase?.().includes(q) ||
        agency.code?.toLowerCase?.().includes(q) ||
        agency.description?.toLowerCase?.().includes(q) ||
        agency.phone?.toLowerCase?.().includes(q) ||
        agency.email?.toLowerCase?.().includes(q);

      const matchesType = type === "ALL" || agency.type === type;

      return matchesSearch && matchesType;
    });
  }, [agencies, deferredSearch, type]);

  return (
    <SettingsListPage
      title="Agentes de Envío"
      heading="Agentes de Envío"
      description="Visualiza y administra las agencias/agentes de envío registradas dentro de la configuración global del sistema."
      tourPrefix="agencias-envio"
      toolbar={
        <ShippingAgenciesToolBar
          search={search}
          setSearch={setSearch}
          type={type}
          setType={setType}
        />
      }
      count={{
        value: agencies ? filteredAgencies.length : undefined,
        singular: "agente",
        plural: "agentes",
      }}
    >
      <SettingsDataTable
        columns={columns}
        data={filteredAgencies}
        loading={isPending}
        error={isError}
        errorMessage="No se pudieron cargar los agentes de envío"
        onRetry={() => refetch()}
        filtered={!!deferredSearch.trim() || type !== "ALL"}
        emptyMessage="No se encontraron agentes de envío."
        actions={<CreateShippingAgencyDialog />}
        tourPrefix="agencias-envio"
        renderSubRow={(agency: ShippingAgency) => (
          <ShippingAgenciesSubRow agency={agency} />
        )}
      />
    </SettingsListPage>
  );
};

export default ShippingAgenciesPage;
