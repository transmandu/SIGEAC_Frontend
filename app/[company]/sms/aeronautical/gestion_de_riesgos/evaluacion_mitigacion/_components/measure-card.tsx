"use client";

import { ChevronDown, ChevronUp, PencilLine } from "lucide-react";

import CreateMitigationMeasure from "@/components/forms/mantenimiento/sms/CreateMitigationMeasure";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { MitigationMeasure } from "@/types/sms/mantenimiento";

import { MeasureDetails } from "./evaluation-workflow-shared";

type MeasureCardProps = {
  measure: MitigationMeasure;
  index: number;
  controlsCount: number;
  isExpanded: boolean;
  isEditing: boolean;
  mitigationPlanId: number;
  onToggleExpand: () => void;
  onToggleEdit: () => void;
  onCloseEdit: () => void;
};

export function MeasureCard({
  measure,
  index,
  controlsCount,
  isExpanded,
  isEditing,
  mitigationPlanId,
  onToggleExpand,
  onToggleEdit,
  onCloseEdit,
}: MeasureCardProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <button
          type="button"
          onClick={onToggleExpand}
          aria-expanded={isExpanded}
          className="flex w-full items-start justify-between gap-3 p-4 text-left transition-colors hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden"
        >
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold">Medida #{index + 1}</span>
              <Badge variant="outline">
                {controlsCount} control{controlsCount === 1 ? "" : "es"}
              </Badge>
            </div>

            <p className="line-clamp-2 text-sm text-muted-foreground">
              {measure.description}
            </p>

            <p className="text-xs text-muted-foreground">
              Responsable: {measure.implementation_responsible}
              <span className="mx-1.5">·</span>
              Fecha: {formatDate(measure.estimated_date)}
            </p>
          </div>

          {isExpanded ? (
            <ChevronUp className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
          )}
        </button>

        {isExpanded ? (
          <div className="space-y-4 border-t p-4">
            <MeasureDetails measure={measure} />

            {isEditing ? (
              <div className="border-t pt-4">
                <CreateMitigationMeasure
                  mitigationPlanId={mitigationPlanId}
                  initialData={measure}
                  onSuccess={onCloseEdit}
                  onCancel={onCloseEdit}
                />
              </div>
            ) : (
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onToggleEdit}
                >
                  <PencilLine className="mr-2 h-4 w-4" />
                  Editar medida
                </Button>
              </div>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
