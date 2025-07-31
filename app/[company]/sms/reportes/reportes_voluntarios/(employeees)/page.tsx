"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import LoadingPage from "@/components/misc/LoadingPage";
import { useGetVoluntaryReports } from "@/hooks/sms/useGetVoluntaryReports";
import { useCompanyStore } from "@/stores/CompanyStore";
import { columns } from "./columns";
import { DataTable } from "./data-table";

const VoluntaryReportsPage = () => {
  const { selectedCompany } = useCompanyStore();
  const { data, isLoading, isError } = useGetVoluntaryReports(
    selectedCompany?.slug
  );

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <ContentLayout title="Reportes Voluntarios">
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

export default VoluntaryReportsPage;
