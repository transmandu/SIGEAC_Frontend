"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, FileText } from "lucide-react";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getBadgeStatusClass } from "@/lib/sms/utils";
import { cn } from "@/lib/utils";

import { DetailGrid } from "../../_components/detail-grid";
import {
    buildAnalysisEntries,
    buildCrewAndAircraftDetails,
    buildObligatoryDetails,
    buildVoluntaryDetails,
    formatDisplayDate,
    getHazardNotification,
    getReportCode,
} from "./report-detail-helpers";
import { ReportAnalysisSection } from "./report-analysis-section";
import { ReportAttachmentsSection } from "./report-attachments-section";
import { ReportHazardNotificationSection } from "./report-hazard-notification-section";
import { ReportMitigationPlanSection } from "./report-mitigation-plan-section";
import { ReportDetailViewProps } from "./report-detail-types";

export function ReportDetailView({ kind, report, backHref, title }: ReportDetailViewProps) {
    const details = report
        ? kind === "RVP"
            ? buildVoluntaryDetails(report)
            : buildObligatoryDetails(report)
        : [];

    const { company } = useParams<{ company: string }>();

    const reportTime =
        kind === "ROS" && report ? (report as { report_time?: string }).report_time ?? null : null;
    const reportNotification = getHazardNotification(report);
    const mitigationPlan = reportNotification?.mitigation_plan ?? null;
    const analysisEntries = buildAnalysisEntries(reportNotification, mitigationPlan);

    return (
        <ContentLayout title={title}>
            <div className="mb-6 flex items-center justify-between gap-3">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                        {kind === "RVP" ? "Reporte voluntario" : "Reporte obligatorio"}
                    </p>
                    <h1 className="text-2xl font-semibold">
                        {report ? getReportCode(report, kind) : "Cargando..."}
                    </h1>
                </div>

                <Button asChild variant="outline">
                    <Link href={backHref}>Volver</Link>
                </Button>
            </div>

            {!report ? (
                <Card>
                    <CardContent className="py-10 text-center text-sm text-muted-foreground">
                        No se encontró el reporte solicitado.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <FileText className="h-5 w-5" />
                                    Información general
                                </CardTitle>
                                <Badge className={cn("border", getBadgeStatusClass(report.status))}>
                                    {report.status}
                                </Badge>
                            </div>
                            <CardDescription className="flex flex-wrap gap-4 text-sm">
                                <span className="inline-flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {formatDisplayDate(report.report_date)}
                                </span>
                                {reportTime ? (
                                    <span className="inline-flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        {String(reportTime)}
                                    </span>
                                ) : null}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DetailGrid items={details} />
                        </CardContent>
                    </Card>

                    {kind === "ROS" ? (
                        <Card>
                            <CardHeader className="space-y-2">
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <FileText className="h-5 w-5" />
                                    Vuelo y aeronave
                                </CardTitle>
                                <CardDescription>Tripulación y aeronave asociadas al reporte.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <DetailGrid items={buildCrewAndAircraftDetails(report)} />
                            </CardContent>
                        </Card>
                    ) : null}

                    <ReportHazardNotificationSection notification={reportNotification} />

                    <ReportAnalysisSection entries={analysisEntries} />

                    <ReportMitigationPlanSection company={company} mitigationPlan={mitigationPlan} />

                    <ReportAttachmentsSection company={company} report={report} />
                </div>
            )}
        </ContentLayout>
    );
}
