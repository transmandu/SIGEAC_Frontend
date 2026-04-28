"use client";

import { useParams } from "next/navigation";

import LoadingPage from "@/components/misc/LoadingPage";
import { useGetVoluntaryReportById } from "@/hooks/sms/useGetVoluntaryReportById";

import { ReportDetailView } from "../../_components/report-detail-view";

export default function VoluntaryReportDetailPage() {
    const { company, report_id } = useParams<{ company: string; report_id: string }>();

    const { data, isLoading } = useGetVoluntaryReportById({
        company: company,
        id: report_id,
    });

    if (isLoading) {
        return <LoadingPage />;
    }

    return (
        <ReportDetailView
            kind="RVP"
            report={data || null}
            backHref={`/${companySlug}/sms/aeronautical/gestion_de_riesgos/reportes`}
            title="Detalle del reporte voluntario"
        />
    );
}
