"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import LoadingPage from "@/components/misc/LoadingPage";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useGetAvionicsControls } from "@/hooks/mantenimiento/planificacion/useGetAvionicsControls";
import { useCompanyStore } from "@/stores/CompanyStore";
import { AlertTriangle } from "lucide-react";
import { useMemo } from "react";
import { getColumns } from "./columns";
import { DataTable } from "./data-table";

const AvionicsControlPage = () => {
  const { selectedCompany } = useCompanyStore();
  const companySlug = selectedCompany?.slug ?? "";

  const { data: avionicsControls, isLoading, isError } = useGetAvionicsControls(companySlug);

  const columns = useMemo(() => getColumns(companySlug), [companySlug]);

  if (isLoading) return <LoadingPage />;

  return (
    <ContentLayout title="Control de Aviónica">
      <div className="flex flex-col gap-6">
        <PageHeader />

        <div className="flex flex-col gap-2 border-b pb-4">
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <h1 className="text-3xl font-semibold tracking-tight">Control de Aviónica</h1>
              <p className="text-sm text-muted-foreground">
                Inventario certificado de los equipos de aviónica instalados y sus tareas recurrentes (Forma INAC-43-005).
              </p>
            </div>
          </div>
        </div>

        {isError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Ha ocurrido un problema al cargar los datos.</AlertDescription>
          </Alert>
        )}

        <DataTable columns={columns} data={avionicsControls ?? []} />
      </div>
    </ContentLayout>
  );
};

export default AvionicsControlPage;
