'use client';

import { Dispatch, SetStateAction } from 'react';
import { Plus, ShieldCheck } from 'lucide-react';

import CreateMitigationMeasure from '@/components/forms/mantenimiento/sms/CreateMitigationMeasure';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { MitigationMeasure, MitigationPlan } from '@/types/sms/mantenimiento';

import { EmptyWorkflowState } from './evaluation-workflow-shared';
import { toggleNumericId } from './evaluation-workflow-helpers';
import { MeasureCard } from './measure-card';
import { getMeasureControls } from './workflow-helpers';

type EvaluationMeasuresTabProps = {
    hasPlanAndAnalysis: boolean;
    currentMitigationPlan: MitigationPlan | null;
    currentMeasures: MitigationMeasure[];
    measureEditorId: number | 'new' | null;
    expandedMeasureIds: number[];
    setMeasureEditorId: Dispatch<SetStateAction<number | 'new' | null>>;
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
    return (
        <TabsContent value="measures" className="space-y-4">
            {!hasPlanAndAnalysis || !currentMitigationPlan ? (
                <EmptyWorkflowState message="Primero debe registrar el plan de mitigación junto con el análisis para habilitar las medidas." />
            ) : (
                <>
                    <Card className="border-dashed">
                        <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-1.5">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <ShieldCheck className="h-5 w-5" />
                                    Gestión de medidas
                                </CardTitle>
                                <CardDescription>
                                    La lista muestra datos generales y cada medida se puede expandir para ver más detalle.
                                </CardDescription>
                            </div>

                            <Button
                                type="button"
                                onClick={() => setMeasureEditorId((value) => (value === 'new' ? null : 'new'))}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                {measureEditorId === 'new'
                                    ? 'Ocultar formulario'
                                    : currentMeasures.length
                                      ? 'Crear medida'
                                      : 'Crear primera medida'}
                            </Button>
                        </CardHeader>

                        {measureEditorId === 'new' ? (
                            <CardContent>
                                <CreateMitigationMeasure
                                    mitigationPlanId={currentMitigationPlan.id}
                                    onSuccess={() => setMeasureEditorId(null)}
                                    onCancel={() => setMeasureEditorId(null)}
                                />
                            </CardContent>
                        ) : null}
                    </Card>

                    {currentMeasures.length ? (
                        <div className="space-y-4">
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
                                            setExpandedMeasureIds((ids) => toggleNumericId(ids, measure.id))
                                        }
                                        onToggleEdit={() => {
                                            setMeasureEditorId((value) => (value === measure.id ? null : measure.id));
                                            setExpandedMeasureIds((ids) =>
                                                ids.includes(measure.id) ? ids : [...ids, measure.id]
                                            );
                                        }}
                                        onCloseEdit={() => setMeasureEditorId(null)}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <EmptyWorkflowState message="Aún no hay medidas de mitigación cargadas para esta notificación." />
                    )}
                </>
            )}
        </TabsContent>
    );
}
