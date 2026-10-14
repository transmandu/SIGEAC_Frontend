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
import { motion } from "motion/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex h-auto w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-100/60 p-1.5 dark:border-slate-700/60 dark:bg-slate-800/50">
            {TABS.map(({ value, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="relative h-8 w-56 flex-none rounded-lg border border-slate-200/70 bg-transparent px-3 py-0 dark:border-slate-700/40 data-[state=active]:border-transparent text-sm font-medium text-muted-foreground shadow-none transition-colors hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                {tab === value && (
                  <motion.span
                    layoutId="units-tab-pill"
                    className="absolute inset-0 rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-600/60 dark:bg-slate-900"
                    transition={{ type: "spring", stiffness: 500, damping: 36 }}
                  />
                )}
                <span className="relative truncate">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="unidades" className="mt-4">
            {unitsTable}
          </TabsContent>

          <TabsContent value="catalogo" className="mt-4">
            <ConversionCatalogPanel />
          </TabsContent>

          <TabsContent value="conversiones" className="mt-4">
            <ConversionsRegistryPanel />
          </TabsContent>
        </Tabs>
      ) : (
        unitsTable
      )}
    </SettingsListPage>
  );
};

export default UnitsPage;
