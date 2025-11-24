"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import LoadingPage from "@/components/misc/LoadingPage";
import { useGetObligatoryReports } from "@/hooks/sms/useGetObligatoryReports";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetSurveys } from "@/hooks/sms/survey/useGetSurveys";
// need to change the hook to get surveys

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
