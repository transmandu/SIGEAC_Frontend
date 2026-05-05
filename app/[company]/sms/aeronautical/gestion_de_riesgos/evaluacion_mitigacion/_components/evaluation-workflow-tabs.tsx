'use client';

import { ClipboardCheck, FileText, ShieldCheck } from 'lucide-react';
import { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { WorkflowTabValue } from './evaluation-workflow-helpers';

type EvaluationWorkflowTabsProps = {
    defaultTab: WorkflowTabValue;
    hasPlanAndAnalysis: boolean;
    hasPostMitigationAnalysis: boolean;
    currentMeasuresCount: number;
    totalControls: number;
    hasMitigationPlan: boolean;
    children: ReactNode;
    notificationId: number;
};

export function EvaluationWorkflowTabs({
    defaultTab,
    hasPlanAndAnalysis,
    hasPostMitigationAnalysis,
    currentMeasuresCount,
    totalControls,
    hasMitigationPlan,
    children,
    notificationId,
}: EvaluationWorkflowTabsProps) {
    return (
        <Tabs key={`workflow-tabs-${notificationId}`} defaultValue={defaultTab} className="space-y-6">
            <TabsList className="grid h-auto w-full grid-cols-1 gap-2 bg-transparent p-0 md:grid-cols-2 xl:grid-cols-4">
                <TabsTrigger
                    value="plan"
                    className="h-auto min-w-0 items-start justify-between gap-2 rounded-lg border bg-background/70 px-4 py-3 text-left whitespace-normal data-[state=active]:border-primary dark:bg-muted/20"
                >
                    <span className="flex min-w-0 items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0" />
                        <span className="break-words leading-snug">Plan y análisis</span>
                    </span>
                    <Badge variant="outline" className="shrink-0">
                        {hasPlanAndAnalysis ? 'Listo' : 'Pendiente'}
                    </Badge>
                </TabsTrigger>

                <TabsTrigger
                    value="measures"
                    className="h-auto min-w-0 items-start justify-between gap-2 rounded-lg border bg-background/70 px-4 py-3 text-left whitespace-normal data-[state=active]:border-primary dark:bg-muted/20"
                    disabled={!hasPlanAndAnalysis || !hasMitigationPlan}
                >
                    <span className="flex min-w-0 items-center gap-2">
                        <ShieldCheck className="h-4 w-4 shrink-0" />
                        <span className="break-words leading-snug">Medidas de mitigación</span>
                    </span>
                    <Badge variant="outline" className="shrink-0">
                        {currentMeasuresCount}
                    </Badge>
                </TabsTrigger>

                <TabsTrigger
                    value="controls"
                    className="h-auto min-w-0 items-start justify-between gap-2 rounded-lg border bg-background/70 px-4 py-3 text-left whitespace-normal data-[state=active]:border-primary dark:bg-muted/20"
                    disabled={!hasPlanAndAnalysis || currentMeasuresCount === 0}
                >
                    <span className="flex min-w-0 items-center gap-2">
                        <ClipboardCheck className="h-4 w-4 shrink-0" />
                        <span className="break-words leading-snug">Controles de seguimiento</span>
                    </span>
                    <Badge variant="outline" className="shrink-0">
                        {totalControls}
                    </Badge>
                </TabsTrigger>

                <TabsTrigger
                    value="post-analysis"
                    className="h-auto min-w-0 items-start justify-between gap-2 rounded-lg border bg-background/70 px-4 py-3 text-left whitespace-normal data-[state=active]:border-primary dark:bg-muted/20"
                    disabled={!hasPlanAndAnalysis || !hasMitigationPlan || !currentMeasuresCount}
                >
                    <span className="flex min-w-0 items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0" />
                        <span className="break-words leading-snug">Análisis post mitigación</span>
                    </span>
                    <Badge variant="outline" className="shrink-0">
                        {hasPostMitigationAnalysis ? 'Listo' : 'Pendiente'}
                    </Badge>
                </TabsTrigger>
            </TabsList>

            {children}
        </Tabs>
    );
}
