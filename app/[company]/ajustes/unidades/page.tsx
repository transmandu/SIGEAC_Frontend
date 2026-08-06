"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import LoadingPage from "@/components/misc/LoadingPage";
import { useGetUnits } from "@/hooks/general/unidades/useGetPrimaryUnits";
import { columns } from "./columns";
import { PrimaryDataTable } from "./primary-data-table";
import { ConversionsRegistryPanel } from "./_components/ConversionsRegistryPanel";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useEffect, useMemo, useState } from "react";
import { useTourContext } from "@/components/tour/TourProvider";
import { unidadesSteps } from "@/components/tour/steps/ajustes/unidades";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";

/** Quiénes pueden auditar y corregir las equivalencias ya registradas. */
const CONVERSION_REVIEW_ROLES = ["SUPERUSER", "JEFE_ALMACEN", "ANALISTA_ALMACEN"];

const UnitsPage = () => {
  const { selectedCompany } = useCompanyStore();
  const { user } = useAuth();
  const [tab, setTab] = useState("unidades");

  const {
    data: primaryUnits,
    isLoading: primaryLoading,
    isError: primaryError,
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

  if (primaryLoading) {
    return <LoadingPage />;
  }

  const unitsSection = (
    <div
      className="bg-card rounded-lg border p-4"
      data-tour="unidades-primary-section"
    >
      <h2 className="text-2xl font-semibold mb-4">Unidades</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Gestione las unidades disponibles para los artículos del almacén.
      </p>
      {primaryUnits && <PrimaryDataTable columns={columns} data={primaryUnits} />}
    </div>
  );

  return (
    <ContentLayout title="Unidades">
      <PageHeader />

      <h1
        className="text-5xl font-bold text-center mt-2"
        data-tour="unidades-title"
      >
        Control de Unidades
      </h1>
      <p className="text-sm text-muted-foreground text-center italic mt-2">
        Catálogo de unidades del almacén. Las equivalencias entre unidades se
        definen dentro de cada artículo, porque dependen de su presentación:
        una CAJA de un artículo no contiene lo mismo que la de otro.
      </p>

      <div className="flex justify-center items-center mt-6">
        <div className="w-full max-w-6xl">
          {canReviewConversions ? (
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="unidades">Unidades</TabsTrigger>
                <TabsTrigger value="conversiones">
                  Conversiones registradas
                </TabsTrigger>
              </TabsList>

              <TabsContent value="unidades" className="mt-4">
                {unitsSection}
              </TabsContent>

              <TabsContent value="conversiones" className="mt-4">
                <div className="bg-card rounded-lg border p-4">
                  <h2 className="text-2xl font-semibold mb-1">
                    Conversiones registradas
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Equivalencias declaradas en el sistema y el artículo al que
                    pertenecen. Se crean desde cada artículo; aquí se revisan y
                    corrigen.
                  </p>
                  <ConversionsRegistryPanel />
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            unitsSection
          )}
        </div>
      </div>
    </ContentLayout>
  );
};

export default UnitsPage;
