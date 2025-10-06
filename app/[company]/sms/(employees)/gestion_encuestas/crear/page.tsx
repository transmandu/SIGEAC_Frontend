"use client";

import { CreateSurveyForm } from "@/components/forms/aerolinea/sms/CreateSurveyForm";
import { ContentLayout } from "@/components/layout/ContentLayout";

const CreateSurvey = () => {
  return (
    <ContentLayout title="Crear encuesta">
      <div className="flex flex-col justify-center items-center">
        <CreateSurveyForm onClose={() => false}></CreateSurveyForm>
      </div>
    </ContentLayout>
  );
};

export default CreateSurvey;
