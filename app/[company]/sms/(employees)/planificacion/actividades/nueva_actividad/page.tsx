"use client";

import CreateSMSActivityForm from "@/components/forms/aerolinea/sms/CreateSMSActivityForm";
import { ContentLayout } from "@/components/layout/ContentLayout";

const CreateSMSActivity = () => {
  return (
    <ContentLayout title="Creacion de Actividad SMS " >
      <div className="flex flex-col justify-center items-center">
        <CreateSMSActivityForm
          onClose={() => false}
        ></CreateSMSActivityForm>
      </div>
    </ContentLayout>
  );
};

export default CreateSMSActivity;
