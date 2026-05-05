'use client';

import { CheckCircle2 } from 'lucide-react';

import { cn, formatDate } from '@/lib/utils';
import { Analysis, MitigationMeasure, MitigationPlan, RiskAssessment } from '@/types/sms/mantenimiento';

import { getProbabilityLabel } from './evaluation-workflow-helpers';

export const StepBadge = ({
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
            'flex min-w-0 items-center gap-3 rounded-lg border px-4 py-3',
            completed
                ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/40'
                : 'border-border bg-muted/30'
        )}
    >
        <div
            className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                completed ? 'bg-emerald-600 text-white dark:bg-emerald-500' : 'bg-muted text-muted-foreground'
            )}
        >
            {completed ? <CheckCircle2 className="h-4 w-4" /> : step}
        </div>
        <div className="min-w-0">
            <p className="break-words text-sm font-medium leading-tight">{title}</p>
            <p className="break-words text-xs text-muted-foreground">
                {completed ? 'Completado o en edición' : 'Pendiente'}
            </p>
        </div>
    </div>
);

export function SummaryField({ label, value }: { label: string; value?: string | null }) {
    return (
        <div className="rounded-lg border bg-background/70 p-4 dark:bg-muted/20">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-2 text-sm">{value || 'Sin información registrada'}</p>
        </div>
    );
}

export function EmptyWorkflowState({ message }: { message: string }) {
    return <div className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">{message}</div>;
}

export function PlanSummary({
    mitigationPlan,
    analysis,
}: {
    mitigationPlan: MitigationPlan | null;
    analysis: Analysis | null;
}) {
    if (!mitigationPlan || !analysis) {
        return (
            <EmptyWorkflowState message="Todavía no hay plan y análisis registrados para esta notificación." />
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <SummaryField label="Área responsable" value={mitigationPlan.area_responsible} />
            <SummaryField label="Resultado del análisis" value={analysis.result} />
            <SummaryField label="Consecuencia a evaluar" value={mitigationPlan.consequence_to_evaluate} />
            <SummaryField label="Posibles consecuencias" value={mitigationPlan.possible_consequences} />
            <SummaryField label="Probabilidad" value={analysis.probability} />
            <SummaryField label="Severidad" value={analysis.severity} />
            <div className="md:col-span-2">
                <SummaryField label="Descripción del plan" value={mitigationPlan.description} />
            </div>
        </div>
    );
}

export function RiskAssessmentSummary({
    assessment,
}: {
    assessment: RiskAssessment | null;
}) {
    if (!assessment) {
        return (
            <EmptyWorkflowState message="Todavía no hay una evaluación estimada guardada para esta notificación." />
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <SummaryField label="Probabilidad" value={getProbabilityLabel(assessment.probability)} />
            <SummaryField label="Severidad" value={assessment.severity || 'Pendiente de cálculo'} />
            <SummaryField label="Resultado" value={assessment.result || 'Pendiente de cálculo'} />
            <SummaryField
                label="Última actualización"
                value={assessment.updated_at ? formatDate(assessment.updated_at) : 'Sin registro'}
            />
        </div>
    );
}

export function MeasureDetails({ measure }: { measure: MitigationMeasure }) {
    return (
        <div className="grid gap-3 border-t pt-4 md:grid-cols-2">
            <SummaryField label="Responsable" value={measure.implementation_responsible} />
            <SummaryField label="Supervisor" value={measure.implementation_supervisor} />
            <SummaryField label="Fecha estimada" value={formatDate(measure.estimated_date)} />
            <SummaryField
                label="Fecha de ejecución"
                value={measure.execution_date ? formatDate(measure.execution_date) : 'Pendiente'}
            />
            <div className="md:col-span-2">
                <SummaryField label="Descripción completa" value={measure.description} />
            </div>
        </div>
    );
}
