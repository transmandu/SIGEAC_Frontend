"use client";

import { CreateGeneralObligatoryReportForm } from "@/components/forms/aerolinea/sms/CreateGeneralObligatoryReportForm";
import { ContentLayout } from "@/components/layout/ContentLayout";

const CreateObligatoryReport = () => {
  return (
    <ContentLayout title="Creacion de Reporte Obligatorio">
      <div className="flex flex-col justify-center items-center">
        <CreateGeneralObligatoryReportForm
          onClose={() => false}
        ></CreateGeneralObligatoryReportForm>
      </div>
    </ContentLayout>
  );
};

export default CreateObligatoryReport;
