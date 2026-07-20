"use client";

import { CreateVoluntaryReportForm } from "@/components/forms/aerolinea/sms/CreateVoluntaryReportForm";
import { CreateGenVolReport } from "@/components/forms/mantenimiento/sms/CreateGenVolReport";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useEffect } from "react";
import { useTourContext } from "@/components/tour/TourProvider";

import { voluntarioSteps } from "@/components/tour/steps/general/sms/voluntario";

const CreateVoluntaryReport = () => {
  const { selectedCompany } = useCompanyStore();
  const { registerTour, unregisterTour } = useTourContext();

  useEffect(() => {
    registerTour("reporte-voluntario", "Reporte Voluntario", voluntarioSteps);
    return () => unregisterTour("reporte-voluntario");
  }, [registerTour, unregisterTour]);

  const Component = selectedCompany?.isOMAC
    ? CreateGenVolReport
    : CreateVoluntaryReportForm;
  return (
    <ContentLayout title="Creación de Reporte Voluntario">
      <div
        className="flex flex-col justify-center items-center"
        data-tour="voluntario-header"
      >
        <Component onClose={() => false} />
      </div>
    </ContentLayout>
  );
};

export default CreateVoluntaryReport;
