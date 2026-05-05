"use client";

import { CreateVoluntaryReportForm } from "@/components/forms/aerolinea/sms/CreateVoluntaryReportForm";
import { CreateGenVolReport } from "@/components/forms/mantenimiento/sms/CreateGenVolReport";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { useCompanyStore } from "@/stores/CompanyStore";

const CreateVoluntaryReport = () => {
    const { selectedCompany } = useCompanyStore();

    const Component = selectedCompany?.isOmac ? CreateGenVolReport : CreateVoluntaryReportForm;
    return (
        <ContentLayout title="Creación de Reporte Voluntario">
            <div className="flex flex-col justify-center items-center">
                <Component onClose={() => false} />
            </div>
        </ContentLayout>);
};

export default CreateVoluntaryReport;
