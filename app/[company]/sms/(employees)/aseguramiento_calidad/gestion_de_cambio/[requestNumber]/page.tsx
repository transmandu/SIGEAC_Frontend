"use client";

import { Loader2 } from "lucide-react";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { useIsOmac } from "@/hooks/sistema/useIsOmac";
import { useCompanyStore } from "@/stores/CompanyStore";
import AirlineChangeRequestDetail from "@/app/[company]/sms/(employees)/aseguramiento_calidad/gestion_de_cambio/_components/airline-detail";
import AeronauticalChangeRequestDetail from "@/app/[company]/sms/(employees)/aseguramiento_calidad/gestion_de_cambio/_components/aeronautical-detail";

export default function GestionDeCambioDetailPage() {
  const { selectedCompany } = useCompanyStore();
  const { data: isOMAC, isLoading } = useIsOmac(selectedCompany?.slug);

  if (isLoading) {
    return (
      <ContentLayout title="Detalle de Gestión de Cambio">
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="size-12 animate-spin text-primary" />
        </div>
      </ContentLayout>
    );
  }

  return isOMAC ? (
    <AeronauticalChangeRequestDetail />
  ) : (
    <AirlineChangeRequestDetail />
  );
}
