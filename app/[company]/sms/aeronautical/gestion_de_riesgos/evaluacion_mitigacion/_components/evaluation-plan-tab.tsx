"use client";

import { PencilLine, Plus } from "lucide-react";

import CreateMitigationPlanAnalysis from "@/components/forms/mantenimiento/sms/CreateMitigationPlanAnalysis";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TabsContent } from "@/components/ui/tabs";
import {
  Analysis,
  HazardNotification,
  MitigationPlan,
  RiskAssessment,
} from "@/types/sms/mantenimiento";

import { RiskAssessmentForm } from "./risk-assessment-form";
import {
  PlanSummary,
  RiskAssessmentSummary,
} from "./evaluation-workflow-shared";

type EvaluationPlanTabProps = {
  company: string;
  selectedNotification: HazardNotification;
  currentMitigationPlan: MitigationPlan | null;
  currentPlanAnalysis: Analysis | null;
  currentRiskAssessment: RiskAssessment | null;
  hasRiskAssessment: boolean;
  hasPlanAndAnalysis: boolean;
  isRiskAssessmentFormOpen: boolean;
  isPlanFormOpen: boolean;
  setIsRiskAssessmentFormOpen: (
    open: boolean | ((value: boolean) => boolean),
  ) => void;
  setIsPlanFormOpen: (open: boolean | ((value: boolean) => boolean)) => void;
  onAssessmentSaved: (assessment: RiskAssessment | null) => void;
};

export function EvaluationPlanTab({
  company,
  selectedNotification,
  currentMitigationPlan,
  currentPlanAnalysis,
  currentRiskAssessment,
  hasRiskAssessment,
  hasPlanAndAnalysis,
  isRiskAssessmentFormOpen,
  isPlanFormOpen,
  setIsRiskAssessmentFormOpen,
  setIsPlanFormOpen,
  onAssessmentSaved,
}: EvaluationPlanTabProps) {
  return (
    <TabsContent value="plan" className="mt-0 space-y-4">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Plan y análisis</CardTitle>
          <CardDescription>
            Primero estime el riesgo; después documente el plan de mitigación.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium">Estimación de riesgo</p>
                {hasRiskAssessment ? (
                  <Badge
                    variant="outline"
                    className="border-emerald-200 text-emerald-700 dark:border-emerald-900/60 dark:text-emerald-300"
                  >
                    Listo
                  </Badge>
                ) : null}
              </div>

              <Button
                type="button"
                size="sm"
                variant={isRiskAssessmentFormOpen ? "ghost" : "outline"}
                onClick={() => setIsRiskAssessmentFormOpen((value) => !value)}
              >
                {isRiskAssessmentFormOpen ? (
                  <>Cerrar</>
                ) : hasRiskAssessment ? (
                  <>
                    <PencilLine className="mr-2 h-4 w-4" />
                    Editar
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Estimar
                  </>
                )}
              </Button>
            </div>

            {isRiskAssessmentFormOpen ? (
              <div className="border-t pt-4">
                <RiskAssessmentForm
                  company={company}
                  selectedNotification={selectedNotification}
                  currentAssessment={currentRiskAssessment}
                  onSaved={(assessment) => {
                    onAssessmentSaved(assessment);
                    setIsRiskAssessmentFormOpen(false);
                  }}
                />
              </div>
            ) : hasRiskAssessment ? (
              <RiskAssessmentSummary assessment={currentRiskAssessment} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Aún no hay una estimación de riesgo registrada.
              </p>
            )}
          </section>

          <Separator />

          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium">Plan de mitigación</p>
                {hasPlanAndAnalysis ? (
                  <Badge
                    variant="outline"
                    className="border-emerald-200 text-emerald-700 dark:border-emerald-900/60 dark:text-emerald-300"
                  >
                    Listo
                  </Badge>
                ) : null}
              </div>

              <Button
                type="button"
                size="sm"
                variant={hasPlanAndAnalysis ? "ghost" : "default"}
                onClick={() => setIsPlanFormOpen((value) => !value)}
              >
                {isPlanFormOpen ? (
                  <>Cerrar</>
                ) : hasPlanAndAnalysis ? (
                  <>
                    <PencilLine className="mr-2 h-4 w-4" />
                    Editar
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Completar
                  </>
                )}
              </Button>
            </div>

            {isPlanFormOpen ? (
              <div className="border-t pt-4">
                <CreateMitigationPlanAnalysis
                  key={`plan-${selectedNotification.id}-${currentMitigationPlan?.id || "new"}-${currentPlanAnalysis?.id || "new"}`}
                  hazardNotification={selectedNotification}
                  initialData={{
                    mitigationPlan: currentMitigationPlan,
                    analysis: currentPlanAnalysis,
                  }}
                  suggestedAnalysis={
                    currentRiskAssessment?.severity
                      ? {
                          probability: String(
                            currentRiskAssessment.probability,
                          ),
                          severity: currentRiskAssessment.severity,
                        }
                      : null
                  }
                  onSuccess={() => setIsPlanFormOpen(false)}
                  onCancel={() => setIsPlanFormOpen(false)}
                />
              </div>
            ) : hasPlanAndAnalysis ? (
              <PlanSummary
                mitigationPlan={currentMitigationPlan}
                analysis={currentPlanAnalysis}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Aún no hay un plan de mitigación registrado.
              </p>
            )}
          </section>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
