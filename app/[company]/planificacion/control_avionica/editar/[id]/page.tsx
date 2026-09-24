"use client";

import { useParams } from "next/navigation";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import LoadingPage from "@/components/misc/LoadingPage";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import CreateAvionicsControlForm from "@/components/forms/mantenimiento/planificacion/CreateAvionicsControlForm";
import { useGetAvionicsControl } from "@/hooks/mantenimiento/planificacion/useGetAvionicsControl";
import { useCompanyStore } from "@/stores/CompanyStore";
import { AlertTriangle } from "lucide-react";
import { RetiredControlBanner } from "@/components/planificacion/controles/RetiredControlBanner";

const EditAvionicsControlPage = () => {
  const { id } = useParams<{ id: string }>();
  const { selectedCompany } = useCompanyStore();
  const { data, isLoading, isError } = useGetAvionicsControl(
    selectedCompany?.slug,
    id,
  );

  return (
    <ContentLayout title="Editar Control de Aviónica">
      <div className="flex flex-col gap-6">
        <PageHeader currentLabel={data?.aircraft?.acronym} />

        <div className="flex flex-col gap-2 border-b pb-4">
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <h1 className="text-3xl font-semibold tracking-tight">
                Editar Control de Aviónica
              </h1>
              <p className="text-sm text-muted-foreground">
                Modifique los datos y los equipos de este control.
              </p>
            </div>
          </div>
        </div>

        {isLoading && <LoadingPage />}

        {isError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              No se pudo cargar el control de aviónica.
            </AlertDescription>
          </Alert>
        )}

        {data?.retired_at && (
          <RetiredControlBanner
            control={data}
            recordType="avionics_control"
            noun="control de aviónica"
          />
        )}

        {data && !data.retired_at && (
          <CreateAvionicsControlForm initialData={data} />
        )}
      </div>
    </ContentLayout>
  );
};

export default EditAvionicsControlPage;
