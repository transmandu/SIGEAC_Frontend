"use client";

import { CreateSurveyForm } from "@/components/forms/aerolinea/sms/survey/CreateSurveyForm";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";

const CreateSurvey = () => {
  return (
    <ContentLayout title="Crear encuesta">
      <PageHeader />

      <div className="flex flex-col justify-center items-center">
        <CreateSurveyForm onClose={() => false}></CreateSurveyForm>
      </div>
    </ContentLayout>
  );
};

export default CreateSurvey;
