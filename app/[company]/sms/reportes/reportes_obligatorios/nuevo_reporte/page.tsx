"use client";

import { CreateObligatoryReportForm } from "@/components/forms/aerolinea/sms/CreateObligatoryReportForm";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { useEffect } from "react";
import { useTourContext } from "@/components/tour/TourProvider";
import { obligatorioPageSteps } from "@/components/tour/steps/sms/reportes/obligatorio-page";

const CreateObligatoryReport = () => {
  const { registerTour, unregisterTour } = useTourContext();

  useEffect(() => {
    registerTour(
      "sms-obligatorio-page",
      "Crear Reporte Obligatorio",
      obligatorioPageSteps,
    );
    return () => unregisterTour("sms-obligatorio-page");
  }, [registerTour, unregisterTour]);

  return (
    <ContentLayout title="Creacion de Reporte Obligatorio">
      <div className="flex flex-col justify-center items-center">
        <CreateObligatoryReportForm
          onClose={() => false}
        ></CreateObligatoryReportForm>
      </div>
    </ContentLayout>
  );
};

export default CreateObligatoryReport;
