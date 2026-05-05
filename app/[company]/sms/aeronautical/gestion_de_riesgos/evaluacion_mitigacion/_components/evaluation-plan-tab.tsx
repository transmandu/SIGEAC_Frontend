'use client';

import { ClipboardCheck, FileText, PencilLine, Plus } from 'lucide-react';

import CreateMitigationPlanAnalysis from '@/components/forms/mantenimiento/sms/CreateMitigationPlanAnalysis';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { Analysis, HazardNotification, MitigationPlan, RiskAssessment } from '@/types/sms/mantenimiento';

import { RiskAssessmentForm } from './risk-assessment-form';
import { PlanSummary, RiskAssessmentSummary } from './evaluation-workflow-shared';

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
    setIsRiskAssessmentFormOpen: (open: boolean | ((value: boolean) => boolean)) => void;
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
        <TabsContent value="plan" className="space-y-4">
            <Card className="border-dashed">
                <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1.5">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <ClipboardCheck className="h-5 w-5" />
                            Estimación de riesgo
                        </CardTitle>
                        <CardDescription>
                            Responda el árbol de probabilidad y severidad estimada.
                        </CardDescription>
                    </div>

                    <Button
                        type="button"
                        variant={hasRiskAssessment ? 'outline' : 'default'}
                        className="w-full whitespace-normal sm:w-auto"
                        onClick={() => setIsRiskAssessmentFormOpen((value) => !value)}
                    >
                        {hasRiskAssessment ? <PencilLine className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                        {isRiskAssessmentFormOpen
                            ? 'Ocultar formulario'
                            : hasRiskAssessment
                              ? 'Editar evaluación estimada'
                              : 'Crear evaluación estimada'}
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <RiskAssessmentSummary assessment={currentRiskAssessment} />
                </CardContent>
            </Card>

            {isRiskAssessmentFormOpen ? (
                <Card className="border-dashed">
                    <CardHeader>
                        <CardTitle className="text-base">
                            {hasRiskAssessment ? 'Editar evaluación estimada' : 'Crear evaluación estimada'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RiskAssessmentForm
                            company={company}
                            selectedNotification={selectedNotification}
                            currentAssessment={currentRiskAssessment}
                            onSaved={(assessment) => {
                                onAssessmentSaved(assessment);
                                setIsRiskAssessmentFormOpen(false);
                            }}
                        />
                    </CardContent>
                </Card>
            ) : null}

            <Card className="border-dashed">
                <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1.5">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <FileText className="h-5 w-5" />
                            Plan de mitigación y análisis
                        </CardTitle>
                        <CardDescription>
                            Revise la información cargada y abra el formulario solo cuando necesite crear o editar.
                        </CardDescription>
                    </div>

                    <Button
                        type="button"
                        variant={hasPlanAndAnalysis ? 'outline' : 'default'}
                        className="w-full whitespace-normal sm:w-auto"
                        onClick={() => setIsPlanFormOpen((value) => !value)}
                    >
                        {hasPlanAndAnalysis ? <PencilLine className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                        {isPlanFormOpen
                            ? 'Ocultar formulario'
                            : hasPlanAndAnalysis
                              ? 'Editar plan y análisis'
                              : 'Crear plan y análisis'}
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <PlanSummary mitigationPlan={currentMitigationPlan} analysis={currentPlanAnalysis} />
                </CardContent>
            </Card>

            {isPlanFormOpen ? (
                <Card className="border-dashed">
                    <CardHeader>
                        <CardTitle className="text-base">
                            {hasPlanAndAnalysis ? 'Editar plan y análisis' : 'Crear plan y análisis'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CreateMitigationPlanAnalysis
                            key={`plan-${selectedNotification.id}-${currentMitigationPlan?.id || 'new'}-${currentPlanAnalysis?.id || 'new'}`}
                            hazardNotification={selectedNotification}
                            initialData={{
                                mitigationPlan: currentMitigationPlan,
                                analysis: currentPlanAnalysis,
                            }}
                            suggestedAnalysis={
                                currentRiskAssessment?.severity
                                    ? {
                                          probability: String(currentRiskAssessment.probability),
                                          severity: currentRiskAssessment.severity,
                                      }
                                    : null
                            }
                            onSuccess={() => setIsPlanFormOpen(false)}
                            onCancel={() => setIsPlanFormOpen(false)}
                        />
                    </CardContent>
                </Card>
            ) : null}
        </TabsContent>
    );
}
