'use client'

import { useSearchParams } from "next/navigation";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetIsCompanyOmac } from "@/hooks/sistema/useGetIsCompanyOmac";
import { Loader2 } from "lucide-react";
import RiskManagementTabs from "@/components/misc/RiskManagementTabs";

export default function CreateDangerIdentificationPage() {
    const searchParams = useSearchParams();
    const reporteId = searchParams.get("reporteId");

    const { selectedCompany } = useCompanyStore();
    const { data: isOmac, isLoading } = useGetIsCompanyOmac(selectedCompany?.slug);

    if (!reporteId) {
        throw new Error("Falta el id del reporte en los parámetros de búsqueda");
    }

    return (
        <ContentLayout title="Gestión de Riesgo">
            {isLoading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <RiskManagementTabs
                    reporteId={reporteId}
                    isOmac={!!isOmac}
                />
            )}
        </ContentLayout>
    );
}
