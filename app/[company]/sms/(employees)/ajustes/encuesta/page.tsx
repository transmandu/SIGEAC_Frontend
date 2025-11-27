"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import LoadingPage from "@/components/misc/LoadingPage";
import { useGetSurveys } from "@/hooks/sms/survey/useGetSurveys";
import { columns } from "./columns";
import { DataTable } from "./data-table";

const SurveyListPage = () => {
  const { data, isLoading, isError } = useGetSurveys();
  if (isLoading) {
    return <LoadingPage />;
  }
  return (
    <ContentLayout title="Encuestas">
      <div className="flex flex-col gap-y-2">
        {data && <DataTable columns={columns} data={data} />}
        {isError && (
          <p className="text-sm text-muted-foreground">
            Ha ocurrido un error al cargar las encuestas...
          </p>
        )}
      </div>
    </ContentLayout>
  );
};

export default SurveyListPage;
