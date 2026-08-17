"use client";

import { CreateVoluntaryReportForm } from "@/components/forms/aerolinea/sms/CreateVoluntaryReportForm";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";

const CreateVoluntaryReport = () => {
  return (
    <ContentLayout title="Creación de Reporte Voluntario">
      <PageHeader className="mb-6" />

      <div className="flex flex-col justify-center items-center">
        <CreateVoluntaryReportForm
          onClose={() => false}
        ></CreateVoluntaryReportForm>
      </div>
    </ContentLayout>
  );
};

export default CreateVoluntaryReport;
