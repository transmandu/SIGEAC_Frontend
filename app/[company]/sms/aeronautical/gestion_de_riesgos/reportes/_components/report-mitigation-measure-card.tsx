"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import {
  buildMeasureDetails,
  normalizeControls,
} from "./report-detail-helpers";
import { ReportDataGrid } from "./report-data-grid";
import { ReportFollowUpControlCard } from "./report-follow-up-control-card";
import { MitigationMeasureLike } from "./report-detail-types";

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
  const [isOpen, setIsOpen] = useState(false);
  const controls = normalizeControls(measure);

  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
        className="flex w-full items-start justify-between gap-3 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden"
      >
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">Medida {index + 1}</span>
            <Badge variant="outline">
              {controls.length} control{controls.length === 1 ? "" : "es"}
            </Badge>
          </div>

          <p className="line-clamp-2 text-sm text-muted-foreground">
            {measure.description || "Medida de mitigación sin descripción"}
          </p>

          {measure.implementation_responsible ? (
            <p className="text-xs text-muted-foreground">
              Responsable: {measure.implementation_responsible}
            </p>
          ) : null}
        </div>

        {isOpen ? (
          <ChevronUp className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      {isOpen ? (
        <div className="mt-4 space-y-4 border-t pt-4">
          <ReportDataGrid
            items={buildMeasureDetails(measure)}
            className="sm:grid-cols-2 xl:grid-cols-2"
          />

          <div className="space-y-2">
            <h4 className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Controles de seguimiento
            </h4>

            {controls.length ? (
              <div className="divide-y divide-border/70">
                {controls.map((control, controlIndex) => (
                  <ReportFollowUpControlCard
                    key={
                      control.id ??
                      `${index}-${controlIndex}-${control.description ?? "control"}`
                    }
                    company={company}
                    control={control}
                    controlIndex={controlIndex}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No hay controles de seguimiento registrados para esta medida.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
