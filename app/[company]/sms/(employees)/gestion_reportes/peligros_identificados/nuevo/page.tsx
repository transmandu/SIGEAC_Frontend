"use client";

import CreateDangerIdentificationForm from "@/components/forms/aerolinea/sms/CreateIdentificationForm";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { DangerIdentification } from "@/types";

interface FormProps {
  title: string;
  id: number | string;
  initialData?: DangerIdentification;
  isEditing?: boolean;
  reportType: string;
}

const CreateDangerIdentification = ({
  id,
  isEditing,
  initialData,
  reportType,
}: FormProps) => {
  return (
    <ContentLayout title="Creacion de Identificación de Peligro">
      <div className="flex flex-col justify-center items-center">
        <CreateDangerIdentificationForm
          onClose={() => false}
          id={id}
          isEditing={isEditing}
          initialData={initialData}
          reportType={reportType}
        ></CreateDangerIdentificationForm>
      </div>
    </ContentLayout>
  );
};

export default CreateDangerIdentification;
