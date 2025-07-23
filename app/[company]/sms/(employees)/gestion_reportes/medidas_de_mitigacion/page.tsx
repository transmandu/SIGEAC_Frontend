"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { Loader2 } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useGetVoluntaryReports } from "@/hooks/sms/useGetVoluntaryReports";
import LoadingPage from "@/components/misc/LoadingPage";
import { useGetMitigationTable } from "@/hooks/sms/useGetMitigationTable";
import { useCompanyStore } from "@/stores/CompanyStore";

const MitigationMeasuresPage = () => {
  const { selectedCompany } = useCompanyStore();
  const { data, isLoading, isError } = useGetMitigationTable(selectedCompany);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <ContentLayout title="Medida de Mitigacion">
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

export default MitigationMeasuresPage;
