'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';

import { ContentLayout } from '@/components/layout/ContentLayout';
import { useGetHazardNotifications } from '@/hooks/sms/mantenimiento/useGetHazardNotifications';
import { useCompanyStore } from '@/stores/CompanyStore';

import { EvaluationWorkflowPanel } from './_components/evaluation-workflow-panel';
import { NotificationSelectionPanel } from './_components/notification-selection-panel';
import { sortByNewestDate } from './_components/workflow-helpers';

const EvaluationMitigationPage = () => {
    const params = useParams<{ company: string }>();
    const { selectedCompany } = useCompanyStore();
    const companySlug = selectedCompany?.slug || params.company;

    const [selectedNotificationId, setSelectedNotificationId] = useState<number | null>(null);

    const {
        data: notifications,
        isLoading,
        isError,
    } = useGetHazardNotifications(companySlug);

    const sortedNotifications = useMemo(() => sortByNewestDate(notifications || []), [notifications]);

    const selectedNotification =
        sortedNotifications.find((notification) => notification.id === selectedNotificationId) ||
        null;

    const currentMitigationPlan = selectedNotification?.mitigationPlan || null;
    const currentAnalysis = currentMitigationPlan?.analysis || selectedNotification?.analysis || null;
    const currentMeasures = currentMitigationPlan?.mitigation_measure || [];

    return (
        <ContentLayout title="Evaluación y mitigación">
            <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
                <NotificationSelectionPanel
                    notifications={sortedNotifications}
                    selectedNotificationId={selectedNotificationId}
                    isLoading={isLoading}
                    isError={isError}
                    onSelectNotification={setSelectedNotificationId}
                />

                {!selectedNotification ? (
                    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-lg border border-dashed px-6 py-10 text-center">
                        <h3 className="text-lg font-semibold">No hay una notificación seleccionada</h3>
                        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                            Elija una notificación en el panel izquierdo para comenzar con el plan
                            de mitigación y continuar con las medidas y controles de seguimiento.
                        </p>
                    </div>
                ) : (
                    <EvaluationWorkflowPanel
                        selectedNotification={selectedNotification}
                        currentMitigationPlan={currentMitigationPlan}
                        currentAnalysis={currentAnalysis}
                        currentMeasures={currentMeasures}
                    />
                )}
            </div>
        </ContentLayout>
    );
};

export default EvaluationMitigationPage;
