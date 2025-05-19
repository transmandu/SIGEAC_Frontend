"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { useGetQuotes } from "@/hooks/compras/useGetQuotes";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Loader2 } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useGetObligatoryReports } from "@/hooks/sms/useGetObligatoryReports";
import LoadingPage from "@/components/misc/LoadingPage";

const ObligatoryReportsPage = () => {
  const { data, isLoading, isError } = useGetObligatoryReports();
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
