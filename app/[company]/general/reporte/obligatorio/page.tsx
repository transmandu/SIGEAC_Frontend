"use client";

import { CreateObligatoryReportForm } from "@/components/forms/aerolinea/sms/CreateObligatoryReportForm";
import { CreateGenObliReport } from "@/components/forms/mantenimiento/sms/CreateGenObliReport";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useEffect } from "react";
import { useTourContext } from "@/components/tour/TourProvider";
import { obligatorioSteps } from "@/components/tour/steps/general/sms/obligatorios";

const CreateObligatoryReport = () => {
  const { selectedCompany } = useCompanyStore();
  const { registerTour, unregisterTour } = useTourContext();

  useEffect(() => {
    registerTour(
      "reporte-obligatorio",
      "Reporte Obligatorio",
      obligatorioSteps,
    );

    return () => unregisterTour("reporte-obligatorio");
  }, [registerTour, unregisterTour]);

  const Component = selectedCompany?.isOMAC
    ? CreateGenObliReport
    : CreateObligatoryReportForm;
  return (
    <ContentLayout title="Creacion de Reporte Obligatorio">
      <div
        className="flex flex-col justify-center items-center"
        data-tour="obligatorio-header"
      >
        <Component onClose={() => false}></Component>
      </div>
    </ContentLayout>
  );
};

export default CreateObligatoryReport;
