"use client";

import { Activity, AlertTriangle, Layers3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { DetailGrid } from "../../_components/detail-grid";

import {
    buildAnalysisDetails,
    getProbabilityBadgeClass,
    getSeverityBadgeClass,
} from "./report-detail-helpers";
import { ReportAnalysisEntry } from "./report-detail-types";

type ReportAnalysisSectionProps = {
    entries: ReportAnalysisEntry[];
};

export function ReportAnalysisSection({ entries }: ReportAnalysisSectionProps) {
    if (!entries.length) {
        return null;
    }

    return (
        <Card>
            <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                    <Activity className="h-5 w-5" />
                    Análisis
                </CardTitle>
                <CardDescription>
                    {entries.length > 1
                        ? "Análisis asociados a la notificación de peligro y al plan de mitigación."
                        : "Análisis asociado al elemento vinculado al reporte."}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {entries.map((entry) => (
                    <div key={entry.key} className="space-y-3 rounded-lg border bg-muted/20 p-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div className="space-y-1">
                                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                    {entry.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">{entry.description}</p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <span
                                    className={cn(
                                        "inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs",
                                        getProbabilityBadgeClass(String(entry.analysis.probability)),
                                    )}
                                >
                                    <Activity className="h-4 w-4" />
                                    {String(entry.analysis.probability ?? "N/A")}
                                </span>
                                <span
                                    className={cn(
                                        "inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs",
                                        getSeverityBadgeClass(entry.analysis.severity),
                                    )}
                                >
                                    <AlertTriangle className="h-4 w-4" />
                                    {String(entry.analysis.severity ?? "N/A")}
                                </span>
                                {entry.analysis.result ? (
                                    <Badge className="text-xs">
                                        <Layers3 className="mr-1 h-3.5 w-3.5" />
                                        {String(entry.analysis.result)}
                                    </Badge>
                                ) : null}
                            </div>
                        </div>

                        <DetailGrid items={buildAnalysisDetails(entry.analysis)} />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
