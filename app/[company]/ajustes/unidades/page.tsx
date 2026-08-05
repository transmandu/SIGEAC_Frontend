"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import LoadingPage from "@/components/misc/LoadingPage";
import { useGetUnits } from "@/hooks/general/unidades/useGetPrimaryUnits";
import { columns } from "./columns";
import { PrimaryDataTable } from "./primary-data-table";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useEffect } from "react";
import { useTourContext } from "@/components/tour/TourProvider";
import { unidadesSteps } from "@/components/tour/steps/ajustes/unidades";
import { PageHeader } from "@/components/layout/PageHeader";

const UnitsPage = () => {
  const { selectedCompany } = useCompanyStore();

  const {
    data: primaryUnits,
    isLoading: primaryLoading,
    isError: primaryError,
  } = useGetUnits(selectedCompany?.slug);

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
        <div
          className="bg-card rounded-lg border p-4 w-full max-w-6xl"
          data-tour="unidades-primary-section"
        >
          <h2 className="text-2xl font-semibold mb-4">Unidades</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Gestione las unidades disponibles para los artículos del almacén.
          </p>
          {primaryUnits && (
            <PrimaryDataTable columns={columns} data={primaryUnits} />
          )}
        </div>
      </div>
    </ContentLayout>
  );
};

export default UnitsPage;
