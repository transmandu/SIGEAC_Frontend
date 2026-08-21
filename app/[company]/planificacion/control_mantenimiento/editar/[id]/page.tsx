"use client";

import { useParams } from "next/navigation";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import LoadingPage from "@/components/misc/LoadingPage";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import CreateMaintenanceControlForm from "@/components/forms/mantenimiento/planificacion/CreateMaintenanceControlForm";
import { useGetMaintenanceControl } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceControl";
import { useCompanyStore } from "@/stores/CompanyStore";
import { AlertTriangle } from "lucide-react";

const EditMaintenanceControlPage = () => {
  const { id } = useParams<{ id: string }>();
  const { selectedCompany } = useCompanyStore();
  const { data, isLoading, isError } = useGetMaintenanceControl(selectedCompany?.slug, id);

  return (
    <ContentLayout title="Editar Control de Mantenimiento">
      <PageHeader className="mb-6" />

      <div className="space-y-2">
        <div className="space-y-1 mb-4">
          <h1 className="text-2xl font-bold text-center">Editar Control de Mantenimiento</h1>
          <p className="text-sm text-muted-foreground text-center">
            Modifique los datos, certificados, servicios y partes de este control.
          </p>
        </div>

        {isLoading && <LoadingPage />}

        {isError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>No se pudo cargar el control de mantenimiento.</AlertDescription>
          </Alert>
        )}

        {data && <CreateMaintenanceControlForm initialData={data} />}
      </div>
    </ContentLayout>
  );
};

export default EditMaintenanceControlPage;
