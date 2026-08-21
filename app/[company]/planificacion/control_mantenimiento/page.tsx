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
      <PageHeader className="mb-6" />

      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header className="space-y-1">
          <h1 className="text-4xl font-semibold tracking-tight text-center">
            Control de Mantenimiento
          </h1>
          <p className="text-sm text-muted-foreground text-center">
            Certificados, servicios y partes bajo control por aeronave.
          </p>
        </header>

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
