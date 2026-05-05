'use client';

import { FileStack } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { HazardNotification, MitigationMeasure } from '@/types/sms/mantenimiento';

import { StepBadge } from './evaluation-workflow-shared';
import { getMeasureControls, getNotificationSource, getWorkflowStatus } from './workflow-helpers';

type EvaluationWorkflowHeaderProps = {
    selectedNotification: HazardNotification;
    currentMeasures: MitigationMeasure[];
    hasPlanAndAnalysis: boolean;
    hasPostMitigationAnalysis: boolean;
};

export function EvaluationWorkflowHeader({
    selectedNotification,
    currentMeasures,
    hasPlanAndAnalysis,
    hasPostMitigationAnalysis,
}: EvaluationWorkflowHeaderProps) {
    const workflowStatus = getWorkflowStatus(selectedNotification);

    return (
        <>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <FileStack className="h-5 w-5" />
                    Evaluación y Mitigación
                </CardTitle>
                <CardDescription>
                    Trabajando sobre {getNotificationSource(selectedNotification)}
                </CardDescription>
            </CardHeader>

            <div className="space-y-6">
                <div className="rounded-lg border bg-muted/30 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{getNotificationSource(selectedNotification)}</Badge>
                        <Badge variant="outline">{selectedNotification.report_type}</Badge>
                        <Badge className={cn('border', workflowStatus.className)}>{workflowStatus.label}</Badge>
                    </div>

                    <p className="mt-3 text-sm text-muted-foreground">{selectedNotification.description}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <StepBadge step={1} title="Plan y análisis" completed={hasPlanAndAnalysis} />
                    <StepBadge step={2} title="Medidas de mitigación" completed={currentMeasures.length > 0} />
                    <StepBadge
                        step={3}
                        title="Controles de seguimiento"
                        completed={currentMeasures.some((measure) => getMeasureControls(measure).length > 0)}
                    />
                    <StepBadge
                        step={4}
                        title="Análisis post mitigación"
                        completed={hasPostMitigationAnalysis}
                    />
                </div>
            </div>
        </>
    );
}
