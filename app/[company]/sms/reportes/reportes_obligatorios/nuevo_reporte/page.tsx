"use client";

import { CreateObligatoryReportForm } from "@/components/forms/aerolinea/sms/CreateObligatoryReportForm";
import { ContentLayout } from "@/components/layout/ContentLayout";

const CreateObligatoryReport = () => {
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
