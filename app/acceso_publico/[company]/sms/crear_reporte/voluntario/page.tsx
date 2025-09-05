"use client";

import { CreateGeneralVoluntaryReportForm } from "@/components/forms/aerolinea/sms/CreateGeneralVoluntaryReportForm";
import { GuestContentLayout } from "@/components/layout/GuestContentLayout";

const CreateVoluntaryReport = () => {
  return (
    <GuestContentLayout title="Reporte Voluntario">
      <div className="flex flex-col justify-center items-center">
        <CreateGeneralVoluntaryReportForm
          onClose={() => false}
        ></CreateGeneralVoluntaryReportForm>
      </div>
    </GuestContentLayout>
  );
};

export default CreateVoluntaryReport;
