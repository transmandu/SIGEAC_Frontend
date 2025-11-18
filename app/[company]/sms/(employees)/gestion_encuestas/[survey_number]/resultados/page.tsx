"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import LoadingPage from "@/components/misc/LoadingPage";
import { useGetSurveyResponses } from "@/hooks/sms/survey/useGetResponsesBySurvey";
import { useParams } from "next/navigation";
import { columns } from "./columns";
import { DataTable } from "./data-table";

const SurveyListPage = () => {
  const params = useParams();
  const survey_number = params.survey_number as string;
  const { data, isLoading, isError } = useGetSurveyResponses(survey_number);
  if (isLoading) {
    return <LoadingPage />;
  }
  return (
    <ContentLayout title="Respuestas a la encuesta">
      <div className="flex flex-col gap-y-2">
        {data && <DataTable columns={columns} data={data} />}
        {isError && (
          <p className="text-sm text-muted-foreground">
            Ha ocurrido un error al cargar las respuestas...
          </p>
        )}
      </div>
    </ContentLayout>
  );
};

export default SurveyListPage;
