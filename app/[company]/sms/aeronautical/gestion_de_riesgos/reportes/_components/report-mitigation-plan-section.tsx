"use client";

import { Layers3 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { DetailGrid } from "../../_components/detail-grid";

import { buildMitigationPlanDetails } from "./report-detail-helpers";
import { MitigationPlanLike } from "./report-detail-types";
import { ReportMitigationMeasureCard } from "./report-mitigation-measure-card";

type ReportMitigationPlanSectionProps = {
    company: string;
    mitigationPlan: MitigationPlanLike | null;
};

export function ReportMitigationPlanSection({
    company,
    mitigationPlan,
}: ReportMitigationPlanSectionProps) {
    if (!mitigationPlan) {
        return null;
    }

    return (
        <Card>
            <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                    <Layers3 className="h-5 w-5" />
                    Plan de mitigación
                </CardTitle>
                <CardDescription>
                    Medidas y controles de seguimiento asociados.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <DetailGrid items={buildMitigationPlanDetails(mitigationPlan)} />

                {mitigationPlan.measures?.length ? (
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                            Medidas
                        </h3>
                        <div className="space-y-4">
                            {mitigationPlan.measures.map((measure, index) => (
                                <ReportMitigationMeasureCard
                                    key={measure.id ?? `${index}-${measure.description ?? "measure"}`}
                                    company={company}
                                    measure={measure}
                                    index={index}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        No hay medidas registradas para este plan.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
