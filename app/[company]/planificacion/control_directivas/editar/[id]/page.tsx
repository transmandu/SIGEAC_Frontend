"use client";

import { useParams } from "next/navigation";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import LoadingPage from "@/components/misc/LoadingPage";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import CreateDirectiveControlForm from "@/components/forms/mantenimiento/planificacion/CreateDirectiveControlForm";
import { useGetDirectiveControl } from "@/hooks/mantenimiento/planificacion/useGetDirectiveControl";
import { useCompanyStore } from "@/stores/CompanyStore";
import { AlertTriangle } from "lucide-react";

const EditDirectiveControlPage = () => {
  const { id } = useParams<{ id: string }>();
  const { selectedCompany } = useCompanyStore();
  const { data, isLoading, isError } = useGetDirectiveControl(selectedCompany?.slug, id);

  return (
    <ContentLayout title="Editar Control de Directivas">
      <div className="flex flex-col gap-6">
        <PageHeader currentLabel={data?.aircraft?.acronym} />

        <div className="flex flex-col gap-2 border-b pb-4">
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <h1 className="text-3xl font-semibold tracking-tight">Editar Control de Directivas</h1>
              <p className="text-sm text-muted-foreground">Modifique los datos y las AD de este control.</p>
            </div>
          </div>
        </div>

        {isLoading && <LoadingPage />}

        {isError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>No se pudo cargar el control de directivas.</AlertDescription>
          </Alert>
        )}

        {data && <CreateDirectiveControlForm initialData={data} />}
      </div>
    </ContentLayout>
  );
};

export default EditDirectiveControlPage;
