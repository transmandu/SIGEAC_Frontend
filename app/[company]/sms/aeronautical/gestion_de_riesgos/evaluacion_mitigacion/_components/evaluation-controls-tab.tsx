'use client';

import { Dispatch, SetStateAction } from 'react';
import { Plus, ShieldCheck } from 'lucide-react';

import CreateFollowUpControl from '@/components/forms/mantenimiento/sms/CreateFollowUpControl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { MitigationMeasure } from '@/types/sms/mantenimiento';

import { EmptyWorkflowState } from './evaluation-workflow-shared';
import { toggleNumericId } from './evaluation-workflow-helpers';
import { FollowUpControlCard } from './follow-up-control-card';
import { getMeasureControls } from './workflow-helpers';

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
        <TabsContent value="controls" className="space-y-4">
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
                        <Card key={measure.id} className="border-dashed">
                            <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="space-y-1.5">
                                    <CardTitle className="text-lg">Controles de la medida #{measure.id}</CardTitle>
                                    <CardDescription>
                                        Cada control aparece como resumen y puede expandirse para ver más detalle.
                                    </CardDescription>
                                </div>

                                <Button
                                    type="button"
                                    onClick={() =>
                                        setControlEditorKey((value) => (value === createControlKey ? null : createControlKey))
                                    }
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    {isCreatingControl
                                        ? 'Ocultar formulario'
                                        : controls.length
                                          ? 'Agregar control'
                                          : 'Crear control'}
                                </Button>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div className="rounded-lg border bg-background/70 p-4 dark:bg-muted/20">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <ShieldCheck className="h-4 w-4" />
                                        <p className="font-medium">Medida #{index + 1}</p>
                                        <Badge variant="outline">
                                            {controls.length} control{controls.length === 1 ? '' : 'es'}
                                        </Badge>
                                    </div>
                                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{measure.description}</p>
                                </div>

                                {isCreatingControl ? (
                                    <div className="rounded-lg border bg-muted/20 p-4">
                                        <CreateFollowUpControl
                                            mitigationMeasureId={measure.id}
                                            onSuccess={() => setControlEditorKey(null)}
                                            onCancel={() => setControlEditorKey(null)}
                                        />
                                    </div>
                                ) : null}

                                {controls.length ? (
                                    <div className="space-y-3">
                                        {controls.map((control) => {
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
                                                        setExpandedControlIds((ids) => toggleNumericId(ids, control.id))
                                                    }
                                                    onToggleEdit={() => {
                                                        setControlEditorKey((value) =>
                                                            value === editControlKey ? null : editControlKey
                                                        );
                                                        setExpandedControlIds((ids) =>
                                                            ids.includes(control.id) ? ids : [...ids, control.id]
                                                        );
                                                    }}
                                                    onCloseEdit={() => setControlEditorKey(null)}
                                                />
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <EmptyWorkflowState message="Todavía no hay seguimientos cargados para esta medida." />
                                )}
                            </CardContent>
                        </Card>
                    );
                })
            )}
        </TabsContent>
    );
}
