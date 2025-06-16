"use client";

import { CreateVoluntaryReportForm } from "@/components/forms/CreateVoluntaryReportForm";
import { ContentLayout } from "@/components/layout/ContentLayout";

const CreateVoluntaryReport = () => {
  return (
    <ContentLayout title="Creacion de Reporte Voluntario">
      <div className="flex flex-col justify-center items-center">
        <CreateVoluntaryReportForm
          onClose={() => false}
        ></CreateVoluntaryReportForm>
      </div>
    </ContentLayout>
  );
};

export default CreateVoluntaryReport;
