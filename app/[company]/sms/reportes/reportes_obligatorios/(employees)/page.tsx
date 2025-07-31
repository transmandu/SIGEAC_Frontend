"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import LoadingPage from "@/components/misc/LoadingPage";
import { useGetObligatoryReports } from "@/hooks/sms/useGetObligatoryReports";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useCompanyStore } from "@/stores/CompanyStore";

const ObligatoryReportsPage = () => {
  const { selectedCompany } = useCompanyStore();
  const { data, isLoading, isError } = useGetObligatoryReports(
    selectedCompany?.slug
  );
  if (isLoading) {
    return <LoadingPage />;
  }
  return (
    <ContentLayout title="Reportes Obligatorios">
      <div className="flex flex-col gap-y-2">
        {data && <DataTable columns={columns} data={data} />}
        {isError && (
          <p className="text-sm text-muted-foreground">
            Ha ocurrido un error al cargar los reportes...
          </p>
        )}
      </div>
    </ContentLayout>
  );
};

export default ObligatoryReportsPage;
