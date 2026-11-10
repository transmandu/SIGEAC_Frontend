"use client";

import { Dispatch, SetStateAction } from "react";
import { Plus } from "lucide-react";

import CreateFollowUpControl from "@/components/forms/mantenimiento/sms/CreateFollowUpControl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { MitigationMeasure } from "@/types/sms/mantenimiento";

import { EmptyWorkflowState } from "./evaluation-workflow-shared";
import { toggleNumericId } from "./evaluation-workflow-helpers";
import { FollowUpControlCard } from "./follow-up-control-card";
import { getMeasureControls } from "./workflow-helpers";

type EvaluationControlsTabProps = {
  company: string;
  hasPlanAndAnalysis: boolean;
  currentMeasures: MitigationMeasure[];
  controlEditorKey: string | null;
  expandedControlIds: number[];
  setControlEditorKey: Dispatch<SetStateAction<string | null>>;
  setExpandedControlIds: Dispatch<SetStateAction<number[]>>;
};

export function EvaluationControlsTab({
  company,
  hasPlanAndAnalysis,
  currentMeasures,
  controlEditorKey,
  expandedControlIds,
  setControlEditorKey,
  setExpandedControlIds,
}: EvaluationControlsTabProps) {
  return (
    <TabsContent value="controls" className="mt-0 space-y-4">
      {!hasPlanAndAnalysis ? (
        <EmptyWorkflowState message="Complete primero el plan y análisis para continuar con el seguimiento." />
      ) : !currentMeasures.length ? (
        <EmptyWorkflowState message="Registre al menos una medida de mitigación para poder cargar controles de seguimiento." />
      ) : (
        currentMeasures.map((measure, index) => {
          const controls = getMeasureControls(measure);
          const createControlKey = `new-${measure.id}`;
          const isCreatingControl = controlEditorKey === createControlKey;

          return (
            <Card key={measure.id}>
              <CardHeader className="gap-3 pb-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <CardTitle className="text-base">
                    Medida #{index + 1}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {measure.description}
                  </CardDescription>
                </div>

                {!isCreatingControl ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setControlEditorKey(createControlKey)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar control
                  </Button>
                ) : null}
              </CardHeader>

              <CardContent className="space-y-3">
                {isCreatingControl ? (
                  <div className="border-t pt-4">
                    <CreateFollowUpControl
                      mitigationMeasureId={measure.id}
                      onSuccess={() => setControlEditorKey(null)}
                      onCancel={() => setControlEditorKey(null)}
                    />
                  </div>
                ) : null}

                {controls.length ? (
                  controls.map((control) => {
                    const editControlKey = `edit-${control.id}`;
                    const isEditing = controlEditorKey === editControlKey;
                    const isExpanded = expandedControlIds.includes(control.id);

                    return (
                      <FollowUpControlCard
                        key={control.id}
                        company={company}
                        control={control}
                        measureId={measure.id}
                        isExpanded={isExpanded}
                        isEditing={isEditing}
                        onToggleExpand={() =>
                          setExpandedControlIds((ids) =>
                            toggleNumericId(ids, control.id),
                          )
                        }
                        onToggleEdit={() => {
                          setControlEditorKey((value) =>
                            value === editControlKey ? null : editControlKey,
                          );
                          setExpandedControlIds((ids) =>
                            ids.includes(control.id)
                              ? ids
                              : [...ids, control.id],
                          );
                        }}
                        onCloseEdit={() => setControlEditorKey(null)}
                      />
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Sin controles de seguimiento registrados.
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </TabsContent>
  );
}
