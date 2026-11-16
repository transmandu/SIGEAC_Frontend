"use client";

import { Loader2 } from "lucide-react";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { useIsOmac } from "@/hooks/sistema/useIsOmac";
import { useCompanyStore } from "@/stores/CompanyStore";
import { AirlineChangeRequestsView } from "./_components/airline-change-requests-view";
import { AeronauticalChangeRequestsView } from "./_components/aeronautical-change-requests-view";

const GestionDeCambioPage = () => {
  const { selectedCompany } = useCompanyStore();
  const company = selectedCompany?.slug;
  const { data: isOMAC, isLoading } = useIsOmac(company);

  return (
    <ContentLayout title="Gestión de Cambios">
      <div className="flex flex-col gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Gestión de Cambios
          </h1>
          <p className="text-sm text-muted-foreground">
            Solicitudes de cambio del sistema de gestión de seguridad.
          </p>
        </div>

        {isLoading ? (
          <div className="flex w-full items-center justify-center py-24">
            <Loader2 className="size-10 animate-spin text-muted-foreground" />
          </div>
        ) : isOMAC ? (
          <AeronauticalChangeRequestsView company={company} />
        ) : (
          <AirlineChangeRequestsView company={company} />
        )}
      </div>
    </ContentLayout>
  );
};

export default GestionDeCambioPage;
