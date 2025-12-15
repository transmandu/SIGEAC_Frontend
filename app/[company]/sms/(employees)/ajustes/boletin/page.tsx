"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import LoadingPage from "@/components/misc/LoadingPage";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetSafetyBulletins } from "@/hooks/sms/boletin/useGetSafetyBulletins";

const SurveyListPage = () => {
  const { selectedCompany } = useCompanyStore();
  const { data, isLoading, isError } = useGetSafetyBulletins(selectedCompany?.slug);
  if (isLoading) {
    return <LoadingPage />;
  }
  return (
    <ContentLayout title="Boletines">
      <div className="flex flex-col gap-y-2">
        {data && <DataTable columns={columns} data={data} />}
        {isError && (
          <p className="text-sm text-muted-foreground">
            Ha ocurrido un error al cargar los boletines...
          </p>
        )}
      </div>
    </ContentLayout>
  );
};

export default SurveyListPage;
