"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import LoadingPage from "@/components/misc/LoadingPage";
import { useGetPilots } from "@/hooks/sms/useGetPilots";
import { useCompanyStore } from "@/stores/CompanyStore";
import { PageHeader } from "@/components/layout/PageHeader";

const PilotsPage = () => {
  const { selectedCompany } = useCompanyStore();
  const { data, isLoading, isError } = useGetPilots(selectedCompany?.slug);
  if (isLoading) {
    return <LoadingPage />;
  }
  return (
    <ContentLayout title="Pilotos">
      <PageHeader />

      <div className="flex flex-col gap-y-2">
        {data && <DataTable columns={columns} data={data} />}
        {isError && (
          <p className="text-sm text-muted-foreground">
            Ha ocurrido un error al cargar las fuentes...
          </p>
        )}
      </div>
    </ContentLayout>
  );
};

export default PilotsPage;
