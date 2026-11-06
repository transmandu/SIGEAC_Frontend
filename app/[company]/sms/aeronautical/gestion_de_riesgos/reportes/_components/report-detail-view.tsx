"use client";

import { useParams } from "next/navigation";
import {
  Calendar,
  CalendarCheck,
  Clock,
  FileText,
  MapPin,
  Plane,
  User,
} from "lucide-react";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

import {
  buildAnalysisEntries,
  buildCrewAndAircraftDetails,
  buildObligatoryDetails,
  buildVoluntaryDetails,
  buildVoluntaryReporterDetails,
  formatDisplayDate,
  getAny,
  getHazardNotification,
  getReportCode,
} from "./report-detail-helpers";
import { ReportAnalysisSection } from "./report-analysis-section";
import { ReportAttachmentsSection } from "./report-attachments-section";
import { ReportDataGrid } from "./report-data-grid";
import { ReportHazardNotificationSection } from "./report-hazard-notification-section";
import { ReportMitigationPlanSection } from "./report-mitigation-plan-section";
import { ReportSection } from "./report-section";
import { ReportStatusBadge } from "./report-status-badge";
import {
  ObligatoryReportView,
  ReportDetailViewProps,
  VoluntaryReportView,
} from "./report-detail-types";

const KIND_LABELS = {
  RVP: "Reporte voluntario",
  ROS: "Reporte obligatorio",
} as const;

export function ReportDetailView({
  kind,
  report,
  backHref,
  title,
}: ReportDetailViewProps) {
  const { company } = useParams<{ company: string }>();

  const voluntaryReport =
    kind === "RVP" ? (report as VoluntaryReportView | null) : null;
  const obligatoryReport =
    kind === "ROS" ? (report as ObligatoryReportView | null) : null;

  const details = voluntaryReport
    ? buildVoluntaryDetails(voluntaryReport)
    : obligatoryReport
      ? buildObligatoryDetails(obligatoryReport)
      : [];

  const reporterDetails = voluntaryReport
    ? buildVoluntaryReporterDetails(voluntaryReport)
    : [];

  const crewDetails = obligatoryReport
    ? buildCrewAndAircraftDetails(obligatoryReport)
    : [];

  const reportTime = obligatoryReport
    ? getAny(obligatoryReport, "report_time")
    : null;

  const reportLocation = voluntaryReport
    ? voluntaryReport.danger_location ||
      voluntaryReport.airport_location ||
      (voluntaryReport.location
        ? [voluntaryReport.location.cod_iata, voluntaryReport.location.name]
            .filter(Boolean)
            .join(" - ")
        : "")
    : (obligatoryReport?.incident_location ?? "");

  const reportNotification = getHazardNotification(report);
  const mitigationPlan = reportNotification?.mitigation_plan ?? null;
  const analysisEntries = buildAnalysisEntries(
    reportNotification,
    mitigationPlan,
  );

  const hasReporter = reporterDetails.some(
    (item) =>
      item.value !== undefined && item.value !== null && item.value !== "",
  );
  const hasCrew = crewDetails.some(
    (item) =>
      item.value !== undefined && item.value !== null && item.value !== "",
  );

  return (
    <ContentLayout title={title}>
      <PageHeader
        className="mb-6"
        backFallbackHref={backHref}
        currentLabel={report ? getReportCode(report, kind) : undefined}
      />

      {!report ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No se encontró el reporte solicitado.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-3 p-5 sm:p-6">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight">
                    {getReportCode(report, kind)}
                  </h1>
                  <ReportStatusBadge status={report.status} />
                </div>

                <p className="text-sm text-muted-foreground">
                  {KIND_LABELS[kind]}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {formatDisplayDate(report.report_date)}
                </span>

                {reportTime ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {String(reportTime)}
                  </span>
                ) : null}

                {reportLocation ? (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {reportLocation}
                  </span>
                ) : null}

                {obligatoryReport?.aircraft?.acronym ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Plane className="h-4 w-4" />
                    {obligatoryReport.aircraft.acronym}
                    {obligatoryReport.flight_number
                      ? ` · Vuelo ${obligatoryReport.flight_number}`
                      : ""}
                  </span>
                ) : null}

                {report.status?.toUpperCase() === "CERRADO" &&
                report.close_date ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                    <CalendarCheck className="h-4 w-4" />
                    Cerrado el {formatDisplayDate(report.close_date)}
                  </span>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0 space-y-6">
              <ReportSection icon={FileText} title="Datos del reporte">
                <ReportDataGrid items={details} />
              </ReportSection>

              <ReportHazardNotificationSection
                notification={reportNotification}
              />

              <ReportAnalysisSection entries={analysisEntries} />

              <ReportMitigationPlanSection
                company={company}
                mitigationPlan={mitigationPlan}
              />
            </div>

            <aside className="min-w-0 space-y-6 xl:sticky xl:top-6 xl:self-start">
              {kind === "RVP" && hasReporter ? (
                <ReportSection icon={User} title="Reportante">
                  <ReportDataGrid
                    items={reporterDetails}
                    className="sm:grid-cols-1 xl:grid-cols-1"
                  />
                </ReportSection>
              ) : null}

              {kind === "ROS" && hasCrew ? (
                <ReportSection icon={Plane} title="Vuelo y aeronave">
                  <ReportDataGrid
                    items={crewDetails}
                    className="sm:grid-cols-1 xl:grid-cols-1"
                  />
                </ReportSection>
              ) : null}

              <ReportAttachmentsSection company={company} report={report} />
            </aside>
          </div>
        </div>
      )}
    </ContentLayout>
  );
}
