"use client";

import { Activity } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import {
  buildAnalysisDetails,
  getRiskMatrixTone,
} from "./report-detail-helpers";
import { ReportDataGrid } from "./report-data-grid";
import { ReportSection } from "./report-section";
import { ReportAnalysisEntry } from "./report-detail-types";

type ReportAnalysisSectionProps = {
  entries: ReportAnalysisEntry[];
};

export function ReportAnalysisSection({ entries }: ReportAnalysisSectionProps) {
  if (!entries.length) {
    return null;
  }

  return (
    <ReportSection
      icon={Activity}
      title="Análisis de riesgo"
      description={
        entries.length > 1
          ? "Evaluación previa y posterior a la mitigación."
          : "Evaluación asociada al reporte."
      }
    >
      <div className="space-y-6">
        {entries.map((entry) => {
          const tone = getRiskMatrixTone(entry.analysis);

          return (
            <div
              key={entry.key}
              className={cn("space-y-3 border-l-2 pl-4", tone.accent)}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold">{entry.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.description}
                  </p>
                </div>

                {entry.analysis.result ? (
                  <Badge className={cn("border-transparent", tone.chip)}>
                    {String(entry.analysis.result)}
                  </Badge>
                ) : null}
              </div>

              <ReportDataGrid
                items={buildAnalysisDetails(entry.analysis)}
                className="sm:grid-cols-2 xl:grid-cols-3"
              />
            </div>
          );
        })}
      </div>
    </ReportSection>
  );
}
