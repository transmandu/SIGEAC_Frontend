"use client";

import { Layers3 } from "lucide-react";

import { ReportDataGrid } from "./report-data-grid";
import { ReportSection } from "./report-section";
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

  const measures = mitigationPlan.measures ?? [];

  return (
    <ReportSection
      icon={Layers3}
      title="Plan de mitigación"
      description="Plan, medidas y controles de seguimiento."
    >
      <div className="space-y-5">
        <ReportDataGrid items={buildMitigationPlanDetails(mitigationPlan)} />

        <div className="space-y-3 border-t pt-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Medidas
            </h3>
            <span className="text-xs text-muted-foreground">
              {measures.length === 1
                ? "1 medida registrada"
                : `${measures.length} medidas registradas`}
            </span>
          </div>

          {measures.length ? (
            <div className="divide-y divide-border">
              {measures.map((measure, index) => (
                <ReportMitigationMeasureCard
                  key={
                    measure.id ?? `${index}-${measure.description ?? "measure"}`
                  }
                  company={company}
                  measure={measure}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No hay medidas registradas para este plan.
            </p>
          )}
        </div>
      </div>
    </ReportSection>
  );
}
