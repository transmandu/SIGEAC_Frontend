"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import LoadingPage from "@/components/misc/LoadingPage";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useGetMaintenanceControls } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceControls";
import { useCompanyStore } from "@/stores/CompanyStore";
import { AlertTriangle } from "lucide-react";
import { useMemo } from "react";
import { getColumns } from "./columns";
import { DataTable } from "./data-table";

const MaintenanceControlPage = () => {
  const { selectedCompany } = useCompanyStore();
  const companySlug = selectedCompany?.slug ?? "";

  const {
    data: maintenanceControls,
    isLoading,
    isError,
  } = useGetMaintenanceControls(companySlug);

  const columns = useMemo(() => getColumns(companySlug), [companySlug]);

  if (isLoading) return <LoadingPage />;

  return (
    <ContentLayout title="Control de Mantenimiento">
      <div className="flex flex-col gap-6">
        <PageHeader />

        <div className="flex flex-col gap-2 border-b pb-4">
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <h1 className="text-3xl font-semibold tracking-tight">Control de Mantenimiento</h1>
              <p className="text-sm text-muted-foreground">
                Certificados, servicios y partes bajo control por aeronave.
              </p>
            </div>
          </div>
        </div>

        {isError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Ha ocurrido un problema al cargar los datos.
            </AlertDescription>
          </Alert>
        )}

        <DataTable columns={columns} data={maintenanceControls ?? []} />
      </div>
    </ContentLayout>
  );
};

export default MaintenanceControlPage;
