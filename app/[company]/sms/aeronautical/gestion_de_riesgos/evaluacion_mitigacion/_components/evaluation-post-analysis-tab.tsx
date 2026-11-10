"use client";

import { useState } from "react";
import { LockOpen, Loader2, PencilLine, Plus } from "lucide-react";

import CreateMitigationPlanAnalysis from "@/components/forms/mantenimiento/sms/CreateMitigationPlanAnalysis";
import CloseVoluntaryReportForm from "@/components/forms/mantenimiento/sms/CloseVoluntaryReportForm";
import { useOpenVoluntaryReport } from "@/actions/mantenimiento/sms/reporte_voluntario/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TabsContent } from "@/components/ui/tabs";
import { useCompanyStore } from "@/stores/CompanyStore";
import {
  Analysis,
  HazardNotification,
  MitigationMeasure,
  MitigationPlan,
} from "@/types/sms/mantenimiento";

import { EmptyWorkflowState, SummaryField } from "./evaluation-workflow-shared";

type EvaluationPostAnalysisTabProps = {
  selectedNotification: HazardNotification;
  currentMitigationPlan: MitigationPlan | null;
  currentPostMitigationAnalysis: Analysis | null;
  currentMeasures: MitigationMeasure[];
  hasPlanAndAnalysis: boolean;
  hasPostMitigationAnalysis: boolean;
  isPostAnalysisFormOpen: boolean;
  setIsPostAnalysisFormOpen: (
    open: boolean | ((value: boolean) => boolean),
  ) => void;
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
  const voluntaryReport = selectedNotification.voluntary_report;
  const voluntaryReportStatus = voluntaryReport?.status?.trim().toUpperCase();
  const canCloseReport = Boolean(
    voluntaryReport &&
    voluntaryReportStatus !== "CERRADO" &&
    hasPostMitigationAnalysis,
  );
  const canOpenReport = Boolean(
    voluntaryReport && voluntaryReportStatus === "CERRADO",
  );

  return (
    <TabsContent value="post-analysis" className="mt-0 space-y-4">
      {!hasPlanAndAnalysis || !currentMitigationPlan ? (
        <EmptyWorkflowState message="Complete primero el plan y análisis para registrar el análisis post mitigación." />
      ) : !currentMeasures.length ? (
        <EmptyWorkflowState message="Registre al menos una medida de mitigación antes del análisis post mitigación." />
      ) : (
        <>
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-base">
                    Análisis post mitigación
                  </CardTitle>
                  <CardDescription>
                    Evalúe el riesgo después de aplicar las medidas.
                  </CardDescription>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant={hasPostMitigationAnalysis ? "ghost" : "default"}
                  onClick={() => setIsPostAnalysisFormOpen((value) => !value)}
                >
                  {isPostAnalysisFormOpen ? (
                    <>Cerrar</>
                  ) : hasPostMitigationAnalysis ? (
                    <>
                      <PencilLine className="mr-2 h-4 w-4" />
                      Editar
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Completar
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {isPostAnalysisFormOpen ? (
                <div className="border-t pt-4">
                  <CreateMitigationPlanAnalysis
                    key={`post-analysis-${selectedNotification.id}-${currentMitigationPlan.id}-${currentPostMitigationAnalysis?.id || "new"}`}
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
                </div>
              ) : hasPostMitigationAnalysis ? (
                <div className="grid gap-4 md:grid-cols-3">
                  <SummaryField
                    label="Resultado"
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
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aún no hay un análisis post mitigación registrado.
                </p>
              )}

              {!isPostAnalysisFormOpen && (canCloseReport || canOpenReport) ? (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
                  <p className="text-xs text-muted-foreground">
                    {canCloseReport
                      ? "Al cerrar el reporte se completa el ciclo de gestión."
                      : "Este reporte está cerrado."}
                  </p>

                  {canCloseReport ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => setIsCloseReportOpen(true)}
                    >
                      Cerrar reporte
                    </Button>
                  ) : null}

                  {canOpenReport ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setIsOpenReportOpen(true)}
                    >
                      <LockOpen className="mr-2 h-4 w-4" />
                      Abrir reporte
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Dialog open={isCloseReportOpen} onOpenChange={setIsCloseReportOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-center">
                  Cerrar reporte voluntario
                </DialogTitle>
                <DialogDescription className="text-center">
                  Adjunte el documento PDF de cierre y seleccione la fecha de
                  cierre.
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
                <DialogTitle className="text-center">
                  ¿Abrir reporte voluntario?
                </DialogTitle>
                <DialogDescription className="text-center">
                  Al abrir el reporte, este volverá a estar disponible para
                  gestión. ¿Está seguro de que desea continuar?
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
                      {
                        company: selectedCompany?.slug || null,
                        id: voluntaryReport.id,
                      },
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
