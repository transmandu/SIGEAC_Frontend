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
      <div className="flex flex-col gap-6">
        <PageHeader currentLabel={data?.aircraft?.acronym} />

        <div className="flex flex-col gap-2 border-b pb-4">
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <h1 className="text-3xl font-semibold tracking-tight">Editar Control de Mantenimiento</h1>
              <p className="text-sm text-muted-foreground">
                Modifique los datos, certificados, servicios y partes de este control.
              </p>
            </div>
          </div>
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
