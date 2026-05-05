"use client";

import { useParams } from "next/navigation";

import LoadingPage from "@/components/misc/LoadingPage";
import { useGetObligatoryReportById } from "@/hooks/sms/useGetObligatoryReportById";
import { useCompanyStore } from "@/stores/CompanyStore";

import { ReportDetailView } from "../../_components/report-detail-view";

export default function ObligatoryReportDetailPage() {
  const { company, report_id } = useParams<{ company: string; report_id: string }>();
  const { selectedCompany } = useCompanyStore();
  const companySlug = selectedCompany?.slug || company;

  const { data, isLoading } = useGetObligatoryReportById({
    company: companySlug,
    id: report_id,
  });

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <ReportDetailView
      kind="ROS"
      report={data || null}
      backHref={`/${companySlug}/sms/aeronautical/gestion_de_riesgos/reportes`}
      title="Detalle del reporte obligatorio"
    />
  );
}
