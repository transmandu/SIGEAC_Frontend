"use client";

// Importamos el formulario general
import { CreateGeneralObligatoryReportForm } from "@/components/forms/sms/CreateGeneralObligatoryReportForm";
// Importamos el de OMAC usando un alias (as) para que no choque el nombre
import { CreateGeneralObligatoryReportForm as CreateOmacObligatoryReportForm } from "@/components/forms/sms/omac/CreateGeneralObligatoryReportForm";

import { GuestContentLayout } from "@/components/layout/GuestContentLayout";
import { useParams } from "next/navigation";
import { useGetIsCompanyOmac } from "@/hooks/sistema/useGetIsCompanyOmac";

const CreateObligatoryReport = () => {
    const params = useParams();
    const company = params.company as string;
    const { data: isOmac, isLoading: isOmacLoading } = useGetIsCompanyOmac(company);

    if (isOmacLoading) return <p>Cargando...</p>;

    return (
        <GuestContentLayout title="Reporte Obligatorio">
            <div className="flex flex-col justify-center items-center">
                {/* Renderizado condicional basado en si es OMAC o no */}
                {isOmac ? (
                    <CreateOmacObligatoryReportForm onClose={() => false} />
                ) : (
                    <CreateGeneralObligatoryReportForm onClose={() => false} />
                )}
            </div>
        </GuestContentLayout>
    );
};

export default CreateObligatoryReport;
