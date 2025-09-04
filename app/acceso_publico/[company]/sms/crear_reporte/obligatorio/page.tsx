"use client";

import { CreateGeneralObligatoryReportForm } from "@/components/forms/aerolinea/sms/CreateGeneralObligatoryReportForm";
import { GuestContentLayout } from "@/components/layout/GuestContentLayout";

const CreateObligatoryReport = () => {
  return (
    <GuestContentLayout title="Creación de Reporte Obligatorio">
      <div className="flex flex-col justify-center items-center">
        <CreateGeneralObligatoryReportForm
          onClose={() => false}
        ></CreateGeneralObligatoryReportForm>
      </div>
    </GuestContentLayout>
  );
};

export default CreateObligatoryReport;
