import { CheckCircle2, ChevronRight, FileStack, FileText, ShieldCheck } from 'lucide-react';

import CreateFollowUpControl from '@/components/forms/mantenimiento/sms/CreateFollowUpControl';
import CreateMitigationMeasure from '@/components/forms/mantenimiento/sms/CreateMitigationMeasure';
import CreateMitigationPlanAnalysis from '@/components/forms/mantenimiento/sms/CreateMitigationPlanAnalysis';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn, formatDate } from '@/lib/utils';
import {
    Analysis,
    FollowUpControl,
    HazardNotification,
    MitigationMeasure,
    MitigationPlan,
} from '@/types/sms/mantenimiento';

import { getNotificationSource, getWorkflowStatus } from './workflow-helpers';

const StepBadge = ({
    step,
    title,
    completed,
}: {
    step: number;
    title: string;
    completed: boolean;
}) => (
    <div
        className={cn(
            'flex items-center gap-3 rounded-lg border px-4 py-3',
            completed ? 'border-emerald-200 bg-emerald-50' : 'border-border bg-muted/30'
        )}
    >
        <div
            className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold',
                completed ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground'
            )}
        >
            {completed ? <CheckCircle2 className="h-4 w-4" /> : step}
        </div>
        <div>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-xs text-muted-foreground">
                {completed ? 'Completado o en edición' : 'Pendiente'}
            </p>
        </div>
    </div>
);

function FollowUpControlList({ controls }: { controls: FollowUpControl[] }) {
    if (!controls.length) {
        return (
            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                Esta medida aún no tiene controles de seguimiento registrados.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {controls.map((control) => (
                <div key={control.id} className="rounded-lg border bg-background p-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">Control #{control.id}</Badge>
                        <Badge variant="outline">{formatDate(control.date)}</Badge>
                    </div>
                    <p className="mt-3 text-sm">{control.description}</p>
                </div>
            ))}
        </div>
    );
}

function MitigationMeasureCard({ measure }: { measure: MitigationMeasure }) {
    return (
        <Card className="border-dashed">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <ShieldCheck className="h-4 w-4" />
                    Medida #{measure.id}
                </CardTitle>
                <CardDescription>{measure.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="grid gap-3 text-sm md:grid-cols-2">
                    <div>
                        <span className="font-medium">Responsable:</span>{' '}
                        {measure.implementation_responsible}
                    </div>
                    <div>
                        <span className="font-medium">Supervisor:</span>{' '}
                        {measure.implementation_supervisor}
                    </div>
                    <div>
                        <span className="font-medium">Fecha estimada:</span>{' '}
                        {formatDate(measure.estimated_date)}
                    </div>
                    <div>
                        <span className="font-medium">Fecha de ejecución:</span>{' '}
                        {measure.execution_date ? formatDate(measure.execution_date) : 'Pendiente'}
                    </div>
                </div>

                <Separator />

                <div className="space-y-4">
                    <div>
                        <p className="text-sm font-medium">Agregar control de seguimiento</p>
                        <p className="text-sm text-muted-foreground">
                            Los controles quedan agrupados dentro de la medida correspondiente.
                        </p>
                    </div>

                    <CreateFollowUpControl mitigationMeasureId={measure.id} />
                </div>

                <Separator />

                <div className="space-y-3">
                    <p className="text-sm font-medium">Controles registrados</p>
                    <FollowUpControlList controls={measure.follow_up_controls || []} />
                </div>
            </CardContent>
        </Card>
    );
}

type EvaluationWorkflowPanelProps = {
    selectedNotification: HazardNotification;
    currentMitigationPlan: MitigationPlan | null;
    currentAnalysis: Analysis | null;
    currentMeasures: MitigationMeasure[];
};

export function EvaluationWorkflowPanel({
    selectedNotification,
    currentMitigationPlan,
    currentAnalysis,
    currentMeasures,
}: EvaluationWorkflowPanelProps) {
    const workflowStatus = getWorkflowStatus(selectedNotification);
    const hasPlanAndAnalysis = Boolean(currentMitigationPlan && currentAnalysis);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <FileStack className="h-5 w-5" />
                    Flujo de evaluación y mitigación
                </CardTitle>
                <CardDescription>
                    Trabajando sobre {getNotificationSource(selectedNotification)}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div className="rounded-lg border bg-muted/30 p-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline">
                                {getNotificationSource(selectedNotification)}
                            </Badge>
                            <Badge variant="outline">{selectedNotification.report_type}</Badge>
                            <Badge className={cn('border', workflowStatus.className)}>
                                {workflowStatus.label}
                            </Badge>
                        </div>

                        <p className="mt-3 text-sm text-muted-foreground">
                            {selectedNotification.description}
                        </p>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-3">
                        <StepBadge
                            step={1}
                            title="Plan y análisis"
                            completed={hasPlanAndAnalysis}
                        />
                        <StepBadge
                            step={2}
                            title="Medidas de mitigación"
                            completed={currentMeasures.length > 0}
                        />
                        <StepBadge
                            step={3}
                            title="Controles de seguimiento"
                            completed={currentMeasures.some(
                                (measure) => (measure.follow_up_controls || []).length > 0
                            )}
                        />
                    </div>

                    <Card className="border-dashed">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <FileText className="h-5 w-5" />
                                Paso 1. Plan de mitigación y análisis
                            </CardTitle>
                            <CardDescription>
                                En esta etapa se registra el plan base y la evaluación del riesgo
                                antes de pasar a las medidas.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CreateMitigationPlanAnalysis
                                key={`plan-${selectedNotification.id}-${currentMitigationPlan?.id || 'new'}-${currentAnalysis?.id || 'new'}`}
                                hazardNotification={selectedNotification}
                                mitigationPlan={currentMitigationPlan}
                                analysis={currentAnalysis}
                            />
                        </CardContent>
                    </Card>

                    <Card className={cn('border-dashed', !hasPlanAndAnalysis && 'opacity-75')}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <ShieldCheck className="h-5 w-5" />
                                Paso 2. Medidas de mitigación
                            </CardTitle>
                            <CardDescription>
                                Una vez guardado el plan con su análisis, puede agregar tantas
                                medidas como sean necesarias.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {!hasPlanAndAnalysis || !currentMitigationPlan ? (
                                <div className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
                                    Primero debe registrar el plan de mitigación junto con el
                                    análisis para habilitar las medidas.
                                </div>
                            ) : (
                                <>
                                    <CreateMitigationMeasure
                                        mitigationPlanId={currentMitigationPlan.id}
                                    />

                                    <Separator />

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-sm font-medium">Medidas registradas</p>
                                        </div>

                                        {currentMeasures.length ? (
                                            <div className="space-y-4">
                                                {currentMeasures.map((measure) => (
                                                    <MitigationMeasureCard
                                                        key={measure.id}
                                                        measure={measure}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
                                                Aún no hay medidas de mitigación cargadas para
                                                esta notificación.
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </CardContent>
        </Card>
    );
}
