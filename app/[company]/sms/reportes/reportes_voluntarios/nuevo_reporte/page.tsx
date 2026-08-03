"use client";

import { CreateVoluntaryReportForm } from "@/components/forms/aerolinea/sms/CreateVoluntaryReportForm";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";

const CreateVoluntaryReport = () => {
  return (
    <ContentLayout title="Creacion de Reporte Voluntario">
      <PageHeader />

      <div className="flex flex-col justify-center items-center">
        <CreateVoluntaryReportForm
          onClose={() => false}
        ></CreateVoluntaryReportForm>
      </div>
    </ContentLayout>
  );
};

export default CreateVoluntaryReport;
