"use client";

import { useParams } from "next/navigation";
import { GuestContentLayout } from "@/components/layout/GuestContentLayout";
import { useGetSurveySettingNumbers } from "@/hooks/sms/survey/useGetSurveySettingNumbers";
import { useIsOmac } from "@/hooks/sistema/useIsOmac";

// Componentes Airline
import { AirlineSMSTabs } from "./_components/AirlineSMSTabs";
import AirlinePresentationCard from "./_components/AirlinePresentationCard";

// Componentes Aeronautical
import AeronauticalPresentationCard from "./_components/AeronauticalPresentationCard";
import { AeronauticalSMSTabs } from "./_components/AeronauticalSMSTabs";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
const SMSPage = () => {
    const params = useParams();
    const company = params.company as string;

    // Queries
    const { data: surveyNumbers } = useGetSurveySettingNumbers(company);
    const { data: isOmac, isLoading: isOmacLoading } = useIsOmac(company); // Pasamos el slug/id

    // Manejo de carga inicial
    if (isOmacLoading) {
        return (
            <GuestContentLayout title="Seguridad Operacional SMS">
                <div className="flex flex-col justify-center items-center w-full h-[70vh]">
                    <Loader2 className="h-12 w-12 sm:h-20 sm:w-20 animate-spin text-primary origin-center" />
                </div>
            </GuestContentLayout>
        );
    }

    const PresentationCard = isOmac ? AeronauticalPresentationCard : AirlinePresentationCard;
    const SMSTabs = isOmac ? AeronauticalSMSTabs : AirlineSMSTabs;
    return (
        <GuestContentLayout title="Seguridad Operacional SMS">
            <div className={cn(
                "flex flex-col justify-start items-center", // Clases base siempre presentes
                !isOmac && "w-full max-w-6xl mx-auto px-4"   // Solo si NO es OMAC
            )}>
                <PresentationCard company={company} />
                <SMSTabs company={company} surveyNumbers={surveyNumbers} />
            </div>
        </GuestContentLayout>
    );
};

export default SMSPage
