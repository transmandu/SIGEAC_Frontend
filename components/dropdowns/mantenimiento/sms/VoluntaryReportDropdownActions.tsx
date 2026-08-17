"use client";

import { CheckCheck, EyeIcon, Loader2, LockKeyhole, MoreHorizontal, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import CloseVoluntaryReportForm from "@/components/forms/mantenimiento/sms/CloseVoluntaryReportForm";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getResult } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAcceptVoluntaryReport, useDeleteVoluntaryReport } from "@/actions/mantenimiento/sms/reporte_voluntario/actions";
import { VoluntaryReport, ObligatoryReport } from "@/types/sms/mantenimiento";


type ReportDetailActionsProps = {
  report: VoluntaryReport | ObligatoryReport;
  kind: 'RVP' | 'ROS';
};

export function VoluntaryReportDropdownActions({ report, kind }: ReportDetailActionsProps) {
  const { selectedCompany } = useCompanyStore();
  const router = useRouter();
  const { acceptVoluntaryReport } = useAcceptVoluntaryReport();
  const [openAccept, setOpenAccept] = useState<boolean>(false);
  const [openCloseReport, setOpenCloseReport] = useState<boolean>(false);
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const { deleteVoluntaryReport } = useDeleteVoluntaryReport();

  const mitigationAnalysis = report.hazard_notification?.mitigation_plan?.analysis;
  const closeResult = mitigationAnalysis?.result
    ? getResult(mitigationAnalysis.result)
    : undefined;
  const canCloseReport = Boolean(
    kind === "RVP" &&
    mitigationAnalysis &&
    mitigationAnalysis.result &&
    report.status !== "CERRADO" &&
    (closeResult === "TOLERABLE" || closeResult === "ACEPTABLE")
  );

  const handleAccept = async () => {
    const value = {
      company: selectedCompany!.slug,
      id: report.id.toString(),
    };
    await acceptVoluntaryReport.mutateAsync(value);
    setOpenAccept(false);
  };

  const href =
    kind === "RVP"
      ? `/${selectedCompany?.slug}/sms/aeronautical/gestion_de_riesgos/reportes/voluntarios/${report.id}`
      : `/${selectedCompany?.slug}/sms/aeronautical/gestion_de_riesgos/reportes/obligatorios/${report.id}`;

  const handleDelete = async (id: number | string) => {
    const value = {
      company: selectedCompany!.slug,
      id: id.toString(),
    };
    await deleteVoluntaryReport.mutateAsync(value);
    setOpenDelete(false);
  };

  return (
    <>
      <TooltipProvider>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir acciones</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-auto p-2 flex flex-row gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => router.push(href)}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <EyeIcon className="h-4 w-4" />
                </TooltipTrigger>
                <TooltipContent side="bottom">Ver detalle</TooltipContent>
              </Tooltip>
            </Button>

            {report &&
              (report.status === "ABIERTO" ||
                report.status === "EN_PROCESO") && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setOpenDelete(true)}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Eliminar</TooltipContent>
                  </Tooltip>
                </Button>
              )}

            {report.status === "EN_PROCESO" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setOpenAccept(true)}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CheckCheck className="h-4 w-4 text-green-400" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Aceptar</TooltipContent>
                  </Tooltip>
                </Button>
            )}

            {canCloseReport && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setOpenCloseReport(true)}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <LockKeyhole className="h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Cerrar reporte</TooltipContent>
                  </Tooltip>
                </Button>
            )}
          </PopoverContent>
        </Popover>
      </TooltipProvider>

      {/* Accept dialog */}
      <Dialog open={openAccept} onOpenChange={setOpenAccept}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">
              ¿Seguro que desea aceptar el reporte?
            </DialogTitle>
            <DialogDescription className="text-center p-2 mb-0 pb-0">
              Al aceptar estara disponible para iniciar la gestion.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse gap-2 md:gap-0">
            <Button
              className="bg-rose-400 hover:bg-white hover:text-black hover:border hover:border-black"
              onClick={() => setOpenAccept(false)}
              type="submit"
            >
              Cancelar
            </Button>
            <Button
              disabled={acceptVoluntaryReport.isPending}
              className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
              onClick={() => handleAccept()}
            >
              {acceptVoluntaryReport.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <p>Confirmar</p>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">
              ¿Seguro que desea eliminar el reporte?
            </DialogTitle>
            <DialogDescription className="text-center p-2 mb-0 pb-0">
              Esta acción es irreversible y eliminará por completo el reporte.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse gap-2 md:gap-0">
            <Button
              className="bg-rose-400 hover:bg-white hover:text-black hover:border hover:border-black"
              onClick={() => setOpenDelete(false)}
              type="submit"
            >
              Cancelar
            </Button>
            <Button
              disabled={deleteVoluntaryReport.isPending}
              className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
              onClick={() => handleDelete(report.id)}
            >
              {deleteVoluntaryReport.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <p>Confirmar</p>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close report dialog */}
      <Dialog open={openCloseReport} onOpenChange={setOpenCloseReport}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-center">
              Cerrar reporte voluntario
            </DialogTitle>
            <DialogDescription className="text-center">
              Adjunte el documento PDF de cierre y seleccione la fecha de cierre.
            </DialogDescription>
          </DialogHeader>

          {openCloseReport && (
            <CloseVoluntaryReportForm
              reportId={report.id}
              onSuccess={() => setOpenCloseReport(false)}
              onCancel={() => setOpenCloseReport(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
