'use client';

import { useState } from 'react';
import { FileText, LockOpen, Loader2, PencilLine, Plus } from 'lucide-react';

import CreateMitigationPlanAnalysis from '@/components/forms/mantenimiento/sms/CreateMitigationPlanAnalysis';
import CloseVoluntaryReportForm from '@/components/forms/mantenimiento/sms/CloseVoluntaryReportForm';
import { useOpenVoluntaryReport } from '@/actions/mantenimiento/sms/reporte_voluntario/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TabsContent } from '@/components/ui/tabs';
import { useCompanyStore } from '@/stores/CompanyStore';
import { Analysis, HazardNotification, MitigationMeasure, MitigationPlan } from '@/types/sms/mantenimiento';

import { EmptyWorkflowState, SummaryField } from './evaluation-workflow-shared';
import { getNotificationSource } from './workflow-helpers';

type EvaluationPostAnalysisTabProps = {
    selectedNotification: HazardNotification;
    currentMitigationPlan: MitigationPlan | null;
    currentPostMitigationAnalysis: Analysis | null;
    currentMeasures: MitigationMeasure[];
    hasPlanAndAnalysis: boolean;
    hasPostMitigationAnalysis: boolean;
    isPostAnalysisFormOpen: boolean;
    setIsPostAnalysisFormOpen: (open: boolean | ((value: boolean) => boolean)) => void;
};

export function EvaluationPostAnalysisTab({
    selectedNotification,
    currentMitigationPlan,
    currentPostMitigationAnalysis,
    currentMeasures,
    hasPlanAndAnalysis,
    hasPostMitigationAnalysis,
    isPostAnalysisFormOpen,
    setIsPostAnalysisFormOpen,
}: EvaluationPostAnalysisTabProps) {
    const [isCloseReportOpen, setIsCloseReportOpen] = useState(false);
    const [isOpenReportOpen, setIsOpenReportOpen] = useState(false);
    const { selectedCompany } = useCompanyStore();
    const { openVoluntaryReport } = useOpenVoluntaryReport();
    const voluntaryReport =
        selectedNotification.voluntary_report;
    const voluntaryReportStatus = voluntaryReport?.status?.trim().toUpperCase();
    const canCloseReport = Boolean(
        voluntaryReport && voluntaryReportStatus !== 'CERRADO' && hasPostMitigationAnalysis
    );
    const canOpenReport = Boolean(
        voluntaryReport && voluntaryReportStatus === 'CERRADO'
    );
    console.log('identification seleccionada ', selectedNotification)
    return (
        <TabsContent value="post-analysis" className="space-y-4">
            {!hasPlanAndAnalysis || !currentMitigationPlan ? (
                <EmptyWorkflowState message="Complete primero el plan y análisis para registrar el análisis post mitigación." />
            ) : !currentMeasures.length ? (
                <EmptyWorkflowState message="Registre al menos una medida de mitigación antes del análisis post mitigación." />
            ) : (
                <>
                    <Card className="border-dashed">
                        <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-1.5">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <FileText className="h-5 w-5" />
                                    Análisis post mitigación
                                </CardTitle>
                                <CardDescription>
                                    Este análisis se guarda asociado al plan de mitigación de {getNotificationSource(selectedNotification)}.
                                </CardDescription>
                            </div>

                            <Button
                                type="button"
                                variant={hasPostMitigationAnalysis ? 'outline' : 'default'}
                                className="w-full whitespace-normal sm:w-auto"
                                onClick={() => setIsPostAnalysisFormOpen((value) => !value)}
                            >
                                {hasPostMitigationAnalysis ? (
                                    <PencilLine className="mr-2 h-4 w-4" />
                                ) : (
                                    <Plus className="mr-2 h-4 w-4" />
                                )}
                                {isPostAnalysisFormOpen
                                    ? 'Ocultar formulario'
                                    : hasPostMitigationAnalysis
                                      ? 'Editar análisis post mitigación'
                                      : 'Crear análisis post mitigación'}
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {hasPostMitigationAnalysis ? (
                                <div className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                        <SummaryField
                                            label="Resultado del análisis"
                                            value={currentPostMitigationAnalysis?.result}
                                        />
                                        <SummaryField
                                            label="Probabilidad"
                                            value={currentPostMitigationAnalysis?.probability}
                                        />
                                        <SummaryField
                                            label="Severidad"
                                            value={currentPostMitigationAnalysis?.severity}
                                        />
                                    </div>

                                    {(canCloseReport || canOpenReport) ? (
                                        <div className="flex justify-end gap-2">
                                            {canCloseReport && (
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    onClick={() => setIsCloseReportOpen(true)}
                                                >
                                                    Cerrar reporte
                                                </Button>
                                            )}
                                            {canOpenReport && (
                                                <Button
                                                    type="button"
                                                    variant="default"
                                                    onClick={() => setIsOpenReportOpen(true)}
                                                >
                                                    <LockOpen className="mr-2 h-4 w-4" />
                                                    Abrir reporte
                                                </Button>
                                            )}
                                        </div>
                                    ) : null}
                                </div>
                            ) : (
                                <EmptyWorkflowState message="Todavía no hay análisis post mitigación registrado para este plan." />
                            )}
                        </CardContent>
                    </Card>

                    {isPostAnalysisFormOpen ? (
                        <Card className="border-dashed">
                            <CardHeader>
                                <CardTitle className="text-base">
                                    {hasPostMitigationAnalysis
                                        ? 'Editar análisis post mitigación'
                                        : 'Crear análisis post mitigación'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CreateMitigationPlanAnalysis
                                    key={`post-analysis-${selectedNotification.id}-${currentMitigationPlan.id}-${currentPostMitigationAnalysis?.id || 'new'}`}
                                    hazardNotification={selectedNotification}
                                    mode="analysis-only"
                                    mitigationPlanId={currentMitigationPlan.id}
                                    initialData={{
                                        mitigationPlan: currentMitigationPlan,
                                        analysis: currentPostMitigationAnalysis,
                                    }}
                                    onSuccess={() => setIsPostAnalysisFormOpen(false)}
                                    onCancel={() => setIsPostAnalysisFormOpen(false)}
                                />
                            </CardContent>
                        </Card>
                    ) : null}

                    <Dialog open={isCloseReportOpen} onOpenChange={setIsCloseReportOpen}>
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle className="text-center">Cerrar reporte voluntario</DialogTitle>
                                <DialogDescription className="text-center">
                                    Adjunte el documento PDF de cierre y seleccione la fecha de cierre.
                                </DialogDescription>
                            </DialogHeader>

                            {voluntaryReport ? (
                                <CloseVoluntaryReportForm
                                    reportId={voluntaryReport.id}
                                    onSuccess={() => setIsCloseReportOpen(false)}
                                    onCancel={() => setIsCloseReportOpen(false)}
                                />
                            ) : null}
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isOpenReportOpen} onOpenChange={setIsOpenReportOpen}>
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle className="text-center">¿Abrir reporte voluntario?</DialogTitle>
                                <DialogDescription className="text-center">
                                    Al abrir el reporte, este volverá a estar disponible para gestión.
                                    ¿Está seguro de que desea continuar?
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsOpenReportOpen(false)}
                                    disabled={openVoluntaryReport.isPending}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="button"
                                    disabled={openVoluntaryReport.isPending}
                                    onClick={() => {
                                        if (!voluntaryReport) return;
                                        openVoluntaryReport.mutate(
                                            { company: selectedCompany?.slug || null, id: voluntaryReport.id },
                                            { onSuccess: () => setIsOpenReportOpen(false) },
                                        );
                                    }}
                                >
                                    {openVoluntaryReport.isPending ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <LockOpen className="mr-2 h-4 w-4" />
                                    )}
                                    Confirmar
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </>
            )}
        </TabsContent>
    );
}
