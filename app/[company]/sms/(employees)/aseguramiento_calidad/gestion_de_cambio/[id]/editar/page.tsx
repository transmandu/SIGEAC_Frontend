"use client";

import { useParams } from "next/navigation";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { EditChangeRequestForm } from "@/components/forms/change-request/EditChangeRequestForm";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetChangeRequestById } from "@/hooks/sms/gestion_de_cambio/useGetChangeRequestById";
import { Loader2 } from "lucide-react";

const EditarSolicitudCambioPage = () => {
  const params = useParams();
  const { selectedCompany } = useCompanyStore();
  const id = Number(params.id);

  const { data: changeRequest, isLoading } = useGetChangeRequestById(
    selectedCompany?.slug,
    id
  );

  if (isLoading) {
    return (
      <ContentLayout title="Editar Solicitud de Cambio">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </ContentLayout>
    );
  }

  if (!changeRequest) {
    return (
      <ContentLayout title="Editar Solicitud de Cambio">
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-muted-foreground">
            No se encontró la solicitud de cambio.
          </p>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title={`Editar Solicitud #${changeRequest.id}`}>
      <EditChangeRequestForm changeRequest={changeRequest} />
    </ContentLayout>
  );
};

export default EditarSolicitudCambioPage;
