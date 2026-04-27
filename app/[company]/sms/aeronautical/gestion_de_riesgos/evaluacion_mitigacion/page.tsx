'use client';

import { useMemo, useState } from 'react';
import { PanelLeftOpen, ShieldAlert } from 'lucide-react';
import { useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ContentLayout } from '@/components/layout/ContentLayout';
import { useGetHazardNotifications } from '@/hooks/sms/mantenimiento/useGetHazardNotifications';
import { useCompanyStore } from '@/stores/CompanyStore';

import { EvaluationWorkflowPanel } from './_components/evaluation-workflow-panel';
import { NotificationSelectionPanel } from './_components/notification-selection-panel';
import { getNotificationSource, sortByNewestDate } from './_components/workflow-helpers';

const EvaluationMitigationPage = () => {
    const params = useParams<{ company: string }>();
    const { selectedCompany } = useCompanyStore();
    const companySlug = selectedCompany?.slug || params.company;

    const [selectedNotificationId, setSelectedNotificationId] = useState<number | null>(null);
    const [isNotificationSheetOpen, setIsNotificationSheetOpen] = useState(false);

    const {
        data: notifications,
        isLoading,
        isError,
    } = useGetHazardNotifications(companySlug);

    const sortedNotifications = useMemo(() => sortByNewestDate(notifications || []), [notifications]);

    const selectedNotification =
        sortedNotifications.find((notification) => notification.id === selectedNotificationId) ||
        null;

    const currentMitigationPlan = selectedNotification?.mitigation_plan || null;
    const currentAnalysis = currentMitigationPlan?.analysis || selectedNotification?.analysis || null;
    const currentMeasures = currentMitigationPlan?.measures || [];

    const handleSelectNotification = (notificationId: number) => {
        setSelectedNotificationId(notificationId);
        setIsNotificationSheetOpen(false);
    };

    return (
        <ContentLayout title="Evaluación y mitigación">
            <div className="space-y-6">
                <div className="flex flex-col gap-4 rounded-lg border bg-muted/20 p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium">Notificación activa</p>
                        {selectedNotification ? (
                            <div className="space-y-1">
                                <p className="text-base font-semibold">
                                    {getNotificationSource(selectedNotification)}
                                </p>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {selectedNotification.description}
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Todavía no hay una notificación seleccionada.
                            </p>
                        )}
                    </div>

                    <Sheet open={isNotificationSheetOpen} onOpenChange={setIsNotificationSheetOpen}>
                        <Button type="button" onClick={() => setIsNotificationSheetOpen(true)}>
                            <PanelLeftOpen className="mr-2 h-4 w-4" />
                            {selectedNotification
                                ? 'Cambiar notificación'
                                : 'Seleccionar notificación'}
                        </Button>
                        <SheetContent side="left" className="w-full overflow-y-auto sm:max-w-xl">
                            <SheetHeader className="mb-4">
                                <SheetTitle>Selección de notificación</SheetTitle>
                                <SheetDescription>
                                    Elija la notificación de peligro que desea evaluar o editar.
                                </SheetDescription>
                            </SheetHeader>

                            <NotificationSelectionPanel
                                notifications={sortedNotifications}
                                selectedNotificationId={selectedNotificationId}
                                isLoading={isLoading}
                                isError={isError}
                                onSelectNotification={handleSelectNotification}
                                showSticky={false}
                                className="border-0 shadow-none"
                            />
                        </SheetContent>
                    </Sheet>
                </div>

                {!selectedNotification ? (
                    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-lg border border-dashed px-6 py-10 text-center">
                        <ShieldAlert className="h-10 w-10 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">
                            No hay una notificación seleccionada
                        </h3>
                        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                            Abra el selector para elegir la notificación con la que desea trabajar
                            y continuar con el plan, las medidas y los controles de seguimiento.
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
