"use client";

import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { EditChangeRequestForm } from "@/components/forms/sms/aeronautical/change_requests/EditChangeRequestForm";
import { useGetChangeRequestByNumber } from "@/hooks/sms/aeronautical/gestion_de_cambio/useGetChangeRequestByNumber";
import { useCompanyStore } from "@/stores/CompanyStore";

export default function EditChangeRequestPage() {
  const params = useParams<{ company: string; requestNumber: string }>();
  const { selectedCompany } = useCompanyStore();
  const company = selectedCompany?.slug ?? params.company;
  const { data: changeRequest, isLoading } = useGetChangeRequestByNumber(
    company,
    params.requestNumber,
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
    <ContentLayout title={`Editar Solicitud ${changeRequest.request_number}`}>
      <EditChangeRequestForm changeRequest={changeRequest} />
    </ContentLayout>
  );
}
