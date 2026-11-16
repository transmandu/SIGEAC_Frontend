"use client";

import { Dispatch, SetStateAction } from "react";
import { Plus } from "lucide-react";

import CreateMitigationMeasure from "@/components/forms/mantenimiento/sms/CreateMitigationMeasure";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { MitigationMeasure, MitigationPlan } from "@/types/sms/mantenimiento";

import { EmptyWorkflowState } from "./evaluation-workflow-shared";
import { toggleNumericId } from "./evaluation-workflow-helpers";
import { MeasureCard } from "./measure-card";
import { getMeasureControls } from "./workflow-helpers";

type EvaluationMeasuresTabProps = {
  hasPlanAndAnalysis: boolean;
  currentMitigationPlan: MitigationPlan | null;
  currentMeasures: MitigationMeasure[];
  measureEditorId: number | "new" | null;
  expandedMeasureIds: number[];
  setMeasureEditorId: Dispatch<SetStateAction<number | "new" | null>>;
  setExpandedMeasureIds: Dispatch<SetStateAction<number[]>>;
};

export function EvaluationMeasuresTab({
  hasPlanAndAnalysis,
  currentMitigationPlan,
  currentMeasures,
  measureEditorId,
  expandedMeasureIds,
  setMeasureEditorId,
  setExpandedMeasureIds,
}: EvaluationMeasuresTabProps) {
  const measuresLabel =
    currentMeasures.length === 1
      ? "1 medida registrada"
      : `${currentMeasures.length} medidas registradas`;

  return (
    <TabsContent value="measures" className="mt-0 space-y-4">
      {!hasPlanAndAnalysis || !currentMitigationPlan ? (
        <EmptyWorkflowState message="Primero registre el plan y análisis para habilitar las medidas." />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {currentMeasures.length
                ? measuresLabel
                : "Aún no hay medidas registradas."}
            </p>

            {measureEditorId !== "new" ? (
              <Button
                type="button"
                size="sm"
                onClick={() => setMeasureEditorId("new")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar medida
              </Button>
            ) : null}
          </div>

          {measureEditorId === "new" ? (
            <Card>
              <CardContent className="pt-6">
                <CreateMitigationMeasure
                  mitigationPlanId={currentMitigationPlan.id}
                  onSuccess={() => setMeasureEditorId(null)}
                  onCancel={() => setMeasureEditorId(null)}
                />
              </CardContent>
            </Card>
          ) : null}

          {currentMeasures.map((measure, index) => {
            const controls = getMeasureControls(measure);
            const isEditing = measureEditorId === measure.id;
            const isExpanded = expandedMeasureIds.includes(measure.id);

            return (
              <MeasureCard
                key={measure.id}
                measure={measure}
                index={index}
                controlsCount={controls.length}
                isExpanded={isExpanded}
                isEditing={isEditing}
                mitigationPlanId={currentMitigationPlan.id}
                onToggleExpand={() =>
                  setExpandedMeasureIds((ids) =>
                    toggleNumericId(ids, measure.id),
                  )
                }
                onToggleEdit={() => {
                  setMeasureEditorId((value) =>
                    value === measure.id ? null : measure.id,
                  );
                  setExpandedMeasureIds((ids) =>
                    ids.includes(measure.id) ? ids : [...ids, measure.id],
                  );
                }}
                onCloseEdit={() => setMeasureEditorId(null)}
              />
            );
          })}
        </>
      )}
    </TabsContent>
  );
}
