"use client";

import { CreateGeneralVoluntaryReportForm } from "@/components/forms/aerolinea/sms/CreateGeneralVoluntaryReportForm";
import { CreateVoluntaryReportForm } from "@/components/forms/aerolinea/sms/CreateVoluntaryReportForm";
import { ContentLayout } from "@/components/layout/ContentLayout";

const CreateVoluntaryReport = () => {
  return (
    <ContentLayout title="Creación de Reporte Voluntario">
      <div className="flex flex-col justify-center items-center">
        <CreateGeneralVoluntaryReportForm
          onClose={() => false}
        ></CreateGeneralVoluntaryReportForm>
      </div>
    </ContentLayout>
  );
};

export default CreateVoluntaryReport;
