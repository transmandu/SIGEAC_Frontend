"use client";

import { CreateObligatoryReportForm } from "@/components/forms/aerolinea/sms/CreateObligatoryReportForm";
import { CreateGenObliReport } from "@/components/forms/mantenimiento/sms/CreateGenObliReport";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { useCompanyStore } from "@/stores/CompanyStore";

const CreateObligatoryReport = () => {

    const { selectedCompany } = useCompanyStore();

    const Component = selectedCompany?.isOmac ? CreateGenObliReport : CreateObligatoryReportForm;
    return (
        <ContentLayout title="Creacion de Reporte Obligatorio">
            <div className="flex flex-col justify-center items-center">
                <Component
                    onClose={() => false}
                ></Component>
            </div>
        </ContentLayout>
    );
};

export default CreateObligatoryReport;
