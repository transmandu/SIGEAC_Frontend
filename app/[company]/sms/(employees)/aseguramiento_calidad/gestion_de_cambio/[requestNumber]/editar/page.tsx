"use client";

import { Loader2 } from "lucide-react";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { useIsOmac } from "@/hooks/sistema/useIsOmac";
import { useCompanyStore } from "@/stores/CompanyStore";
import AirlineEditChangeRequest from "@/app/[company]/sms/(employees)/aseguramiento_calidad/gestion_de_cambio/_components/airline-edit";
import AeronauticalEditChangeRequest from "@/app/[company]/sms/(employees)/aseguramiento_calidad/gestion_de_cambio/_components/aeronautical-edit";

export default function EditarSolicitudCambioPage() {
  const { selectedCompany } = useCompanyStore();
  const { data: isOMAC, isLoading } = useIsOmac(selectedCompany?.slug);

  if (isLoading) {
    return (
      <ContentLayout title="Editar Solicitud de Cambio">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </ContentLayout>
    );
  }

  return isOMAC ? (
    <AeronauticalEditChangeRequest />
  ) : (
    <AirlineEditChangeRequest />
  );
}
