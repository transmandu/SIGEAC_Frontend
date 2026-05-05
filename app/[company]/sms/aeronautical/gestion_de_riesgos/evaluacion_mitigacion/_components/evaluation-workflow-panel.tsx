import { useEffect, useState } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { RiskAssessment } from '@/types/sms/mantenimiento';

import { EvaluationControlsTab } from './evaluation-controls-tab';
import {
    EvaluationWorkflowPanelProps,
    getDefaultWorkflowTab,
} from './evaluation-workflow-helpers';
import { EvaluationWorkflowHeader } from './evaluation-workflow-header';
import { EvaluationMeasuresTab } from './evaluation-measures-tab';
import { EvaluationPlanTab } from './evaluation-plan-tab';
import { EvaluationPostAnalysisTab } from './evaluation-post-analysis-tab';
import { EvaluationWorkflowTabs } from './evaluation-workflow-tabs';

export function EvaluationWorkflowPanel({
    company,
    selectedNotification,
    currentMitigationPlan,
    currentPlanAnalysis,
    currentPostMitigationAnalysis,
    currentMeasures,
}: EvaluationWorkflowPanelProps) {
    const hasPlanAndAnalysis = Boolean(currentMitigationPlan && currentPlanAnalysis);
    const hasPostMitigationAnalysis = Boolean(currentPostMitigationAnalysis);
    const totalControls = currentMeasures.reduce((total, measure) => {
        const controls = measure.follow_up_control || measure.follow_up_controls || [];
        return total + controls.length;
    }, 0);
    const defaultTab = getDefaultWorkflowTab(
        hasPlanAndAnalysis,
        currentMeasures,
        hasPostMitigationAnalysis
    );

    const [isPlanFormOpen, setIsPlanFormOpen] = useState(false);
    const [isRiskAssessmentFormOpen, setIsRiskAssessmentFormOpen] = useState(false);
    const [isPostAnalysisFormOpen, setIsPostAnalysisFormOpen] = useState(false);
    const [measureEditorId, setMeasureEditorId] = useState<number | 'new' | null>(null);
    const [controlEditorKey, setControlEditorKey] = useState<string | null>(null);
    const [expandedMeasureIds, setExpandedMeasureIds] = useState<number[]>([]);
    const [expandedControlIds, setExpandedControlIds] = useState<number[]>([]);
    const [assessmentDraft, setAssessmentDraft] = useState<RiskAssessment | null>(null);

    const currentRiskAssessment =
        assessmentDraft ||
        selectedNotification.risk_assessment ||
        selectedNotification.riskAssessment ||
        selectedNotification.risk_assessments?.[0] ||
        null;
    const hasRiskAssessment = Boolean(currentRiskAssessment);

    useEffect(() => {
        setIsPlanFormOpen(false);
        setIsRiskAssessmentFormOpen(false);
        setIsPostAnalysisFormOpen(false);
        setMeasureEditorId(null);
        setControlEditorKey(null);
        setExpandedMeasureIds([]);
        setExpandedControlIds([]);
        setAssessmentDraft(null);
    }, [selectedNotification.id]);

    return (
        <Card>
            <CardContent>
                <div className="space-y-6">
                    <EvaluationWorkflowHeader
                        selectedNotification={selectedNotification}
                        currentMeasures={currentMeasures}
                        hasPlanAndAnalysis={hasPlanAndAnalysis}
                        hasPostMitigationAnalysis={hasPostMitigationAnalysis}
                    />

                    <EvaluationWorkflowTabs
                        defaultTab={defaultTab}
                        hasPlanAndAnalysis={hasPlanAndAnalysis}
                        hasPostMitigationAnalysis={hasPostMitigationAnalysis}
                        currentMeasuresCount={currentMeasures.length}
                        totalControls={totalControls}
                        hasMitigationPlan={Boolean(currentMitigationPlan)}
                        notificationId={selectedNotification.id}
                    >
                        <EvaluationPlanTab
                            company={company}
                            selectedNotification={selectedNotification}
                            currentMitigationPlan={currentMitigationPlan}
                            currentPlanAnalysis={currentPlanAnalysis}
                            currentRiskAssessment={currentRiskAssessment}
                            hasRiskAssessment={hasRiskAssessment}
                            hasPlanAndAnalysis={hasPlanAndAnalysis}
                            isRiskAssessmentFormOpen={isRiskAssessmentFormOpen}
                            isPlanFormOpen={isPlanFormOpen}
                            setIsRiskAssessmentFormOpen={setIsRiskAssessmentFormOpen}
                            setIsPlanFormOpen={setIsPlanFormOpen}
                            onAssessmentSaved={setAssessmentDraft}
                        />

                        <EvaluationMeasuresTab
                            hasPlanAndAnalysis={hasPlanAndAnalysis}
                            currentMitigationPlan={currentMitigationPlan}
                            currentMeasures={currentMeasures}
                            measureEditorId={measureEditorId}
                            expandedMeasureIds={expandedMeasureIds}
                            setMeasureEditorId={setMeasureEditorId}
                            setExpandedMeasureIds={setExpandedMeasureIds}
                        />

                        <EvaluationControlsTab
                            company={company}
                            hasPlanAndAnalysis={hasPlanAndAnalysis}
                            currentMeasures={currentMeasures}
                            controlEditorKey={controlEditorKey}
                            expandedControlIds={expandedControlIds}
                            setControlEditorKey={setControlEditorKey}
                            setExpandedControlIds={setExpandedControlIds}
                        />

                        <EvaluationPostAnalysisTab
                            selectedNotification={selectedNotification}
                            currentMitigationPlan={currentMitigationPlan}
                            currentPostMitigationAnalysis={currentPostMitigationAnalysis}
                            currentMeasures={currentMeasures}
                            hasPlanAndAnalysis={hasPlanAndAnalysis}
                            hasPostMitigationAnalysis={hasPostMitigationAnalysis}
                            isPostAnalysisFormOpen={isPostAnalysisFormOpen}
                            setIsPostAnalysisFormOpen={setIsPostAnalysisFormOpen}
                        />
                    </EvaluationWorkflowTabs>
                </div>
            </CardContent>
        </Card>
    );
}
