"use client";

import { CheckCheck, EyeIcon, Loader2, LockKeyhole, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

import CloseVoluntaryReportForm from "@/components/forms/mantenimiento/sms/CloseVoluntaryReportForm";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getResult } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAcceptVoluntaryReport } from "@/actions/mantenimiento/sms/reporte_voluntario/actions";
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

    console.log('can close report', canCloseReport, { mitigationAnalysis, closeResult, reportStatus: report.status });
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

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir acciones</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-40">
                    <DropdownMenuItem
                        onClick={() => {
                            router.push(href);
                        }}
                    >
                        <EyeIcon className="mr-2 h-4 w-4" />
                        Ver detalle
                    </DropdownMenuItem>


                    {report.status === 'EN_PROCESO' &&
                        (<DropdownMenuItem onClick={() => setOpenAccept(true)}>
                            <CheckCheck className="size-5 text-green-400" />
                            <p className="pl-2">Aceptar</p>
                        </DropdownMenuItem>)}

                    {canCloseReport && (
                        <DropdownMenuItem onClick={() => setOpenCloseReport(true)}>
                            <LockKeyhole className="size-5" />
                            <p className="pl-2">Cerrar reporte</p>
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Delete dialog */}
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
