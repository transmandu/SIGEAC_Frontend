"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { DetailGrid } from "../../_components/detail-grid";

import {
    buildMeasureDetails,
    normalizeControls,
} from "./report-detail-helpers";
import { MitigationMeasureLike } from "./report-detail-types";
import { ReportFollowUpControlCard } from "./report-follow-up-control-card";

type ReportMitigationMeasureCardProps = {
    company: string;
    measure: MitigationMeasureLike;
    index: number;
};

export function ReportMitigationMeasureCard({
    company,
    measure,
    index,
}: ReportMitigationMeasureCardProps) {
    const controls = normalizeControls(measure);

    return (
        <Card className="border-dashed">
            <CardHeader className="space-y-2">
                <CardTitle className="text-lg">Medida {index + 1}</CardTitle>
                <CardDescription>
                    {measure.description || "Medida de mitigación sin descripción"}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <DetailGrid items={buildMeasureDetails(measure)} />

                <div className="space-y-3">
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Controles de seguimiento
                    </h4>

                    {controls.length ? (
                        <div className="space-y-3">
                            {controls.map((control, controlIndex) => (
                                <ReportFollowUpControlCard
                                    key={
                                        control.id ??
                                        `${index}-${controlIndex}-${control.description ?? "control"}`
                                    }
                                    company={company}
                                    control={control}
                                    controlIndex={controlIndex}
                                    measureIndex={index}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            No hay controles de seguimiento registrados para esta medida.
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
