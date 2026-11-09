"use client";

import { Loader2 } from "lucide-react";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { CreateChangeRequestForm as AirlineCreateChangeRequestForm } from "@/components/forms/sms/change_requests/CreateChangeRequestForm";
import { CreateChangeRequestForm as AeronauticalCreateChangeRequestForm } from "@/components/forms/sms/aeronautical/change_requests/CreateChangeRequestForm";
import { useIsOmac } from "@/hooks/sistema/useIsOmac";
import { useCompanyStore } from "@/stores/CompanyStore";

const CrearSolicitudCambioPage = () => {
  const { selectedCompany } = useCompanyStore();
  const { data: isOMAC, isLoading } = useIsOmac(selectedCompany?.slug);

  return (
    <ContentLayout title="Nueva Solicitud de Cambio">
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : isOMAC ? (
        <AeronauticalCreateChangeRequestForm />
      ) : (
        <AirlineCreateChangeRequestForm />
      )}
    </ContentLayout>
  );
};

export default CrearSolicitudCambioPage;
