"use client";

import { CreateGeneralVoluntaryReportForm } from "@/components/forms/aerolinea/sms/CreateGeneralVoluntaryReportForm";
import { CreateGenVolReport } from "@/components/forms/mantenimiento/sms/CreateGenVolReport";
import { GuestContentLayout } from "@/components/layout/GuestContentLayout";
import { useIsOmac } from "@/hooks/sistema/useIsOmac";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";

const CreateVoluntaryReport = () => {
    const { company } = useParams();
    const { data: isOmac, isLoading: isOmacLoading } = useIsOmac(company as string);

    // Extracted content logic to avoid "pyramid of doom" ternaries in the main return
    const renderContent = () => {
        if (isOmacLoading) {
            return (
                <div className="flex h-[70vh] w-full items-center justify-center">
                    <Loader2 className="text-primary h-12 w-12 animate-spin origin-center sm:h-20 sm:w-20" />
                </div>
            );
        }

        // Dynamically assign the component based on the condition
        const FormComponent = isOmac ? CreateGenVolReport : CreateGeneralVoluntaryReportForm;

        return (
            <div className="flex flex-col items-center justify-center">
                <FormComponent onClose={() => false} />
            </div>
        );
    };

    return (
        <GuestContentLayout title="Reporte Voluntario">
            {renderContent()}
        </GuestContentLayout>
    );
};

export default CreateVoluntaryReport;
