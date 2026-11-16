"use client";

import { useEffect, useMemo, useState } from "react";
import { SettingsListPage } from "@/components/layout/SettingsListPage";
import { SettingsDataTable } from "@/components/tables/SettingsDataTable";
import { CreateUnitDialog } from "@/components/dialogs/ajustes/CreateUnitDialog";
import { useGetUnits } from "@/hooks/general/unidades/useGetPrimaryUnits";
import { ConversionsRegistryPanel } from "./_components/ConversionsRegistryPanel";
import { ConversionCatalogPanel } from "./_components/ConversionCatalogPanel";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useTourContext } from "@/components/tour/TourProvider";
import { unidadesSteps } from "@/components/tour/steps/ajustes/unidades";
import {
  SegmentedTabs,
  SegmentedTabsContent,
  SegmentedTabsList,
  SegmentedTabsTrigger,
} from "@/components/misc/SegmentedTabs";
import { useAuth } from "@/contexts/AuthContext";
import { columns } from "./columns";

/** Quiénes pueden auditar y corregir las equivalencias ya registradas. */
const CONVERSION_REVIEW_ROLES = [
  "SUPERUSER",
  "JEFE_ALMACEN",
  "ANALISTA_ALMACEN",
];

const TABS = [
  { value: "unidades", label: "Unidades" },
  { value: "catalogo", label: "Catálogo de equivalencias" },
  { value: "conversiones", label: "Conversiones registradas" },
] as const;

const UnitsPage = () => {
  const { selectedCompany } = useCompanyStore();
  const { user } = useAuth();
  const [tab, setTab] = useState("unidades");

  const {
    data: primaryUnits,
    isPending,
    isError,
    refetch,
  } = useGetUnits(selectedCompany?.slug);

  const canReviewConversions = useMemo(() => {
    const roles = user?.roles?.map((role) => role.name) ?? [];
    return CONVERSION_REVIEW_ROLES.some((role) => roles.includes(role));
  }, [user?.roles]);

  const { registerTour, unregisterTour } = useTourContext();

  useEffect(() => {
    if (primaryUnits && primaryUnits.length > 0) {
      registerTour("unidades", "Unidades", unidadesSteps);
    }
    return () => unregisterTour("unidades");
  }, [registerTour, unregisterTour, primaryUnits]);

  const unitsTable = (
    <div data-tour="unidades-primary-section">
      <SettingsDataTable
        columns={columns}
        data={primaryUnits ?? []}
        loading={isPending}
        error={isError}
        errorMessage="No se pudieron cargar las unidades"
        onRetry={() => refetch()}
        emptyMessage="No se han encontrado unidades."
        actions={<CreateUnitDialog />}
        tourPrefix="unidades-primary"
      />
    </div>
  );

  return (
    <SettingsListPage
      title="Unidades"
      heading="Control de Unidades"
      description="Catálogo de unidades del almacén. Cada artículo es dueño de sus equivalencias, porque dependen de su presentación: una CAJA de un artículo no contiene lo mismo que la de otro. El catálogo ofrece las que se repiten para copiarlas sin volver a teclearlas."
      tourPrefix="unidades"
    >
      {canReviewConversions ? (
        <SegmentedTabs value={tab} onValueChange={setTab}>
          <SegmentedTabsList className="max-sm:flex-col max-sm:items-stretch">
            {TABS.map(({ value, label }) => (
              <SegmentedTabsTrigger key={value} value={value}>
                {label}
              </SegmentedTabsTrigger>
            ))}
          </SegmentedTabsList>

          <SegmentedTabsContent value="unidades" className="mt-4">
            {unitsTable}
          </SegmentedTabsContent>

          <SegmentedTabsContent value="catalogo" className="mt-4">
            <ConversionCatalogPanel />
          </SegmentedTabsContent>

          <SegmentedTabsContent value="conversiones" className="mt-4">
            <ConversionsRegistryPanel />
          </SegmentedTabsContent>
        </SegmentedTabs>
      ) : (
        unitsTable
      )}
    </SettingsListPage>
  );
};

export default UnitsPage;
