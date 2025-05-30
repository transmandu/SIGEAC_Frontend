"use client";

import CreateSmsActivityForm from "@/components/forms/CreateSmsAtivityForm";
import { CreateVoluntaryReportForm } from "@/components/forms/CreateVoluntaryReportForm";
import { ContentLayout } from "@/components/layout/ContentLayout";

const CreateSMSActivity = () => {
  return (
    <ContentLayout title="Creacion de Actividad SMS " >
      <div className="flex flex-col justify-center items-center">
        <CreateSmsActivityForm
          onClose={() => false}
        ></CreateSmsActivityForm>
      </div>
    </ContentLayout>
  );
};

export default CreateSMSActivity;
