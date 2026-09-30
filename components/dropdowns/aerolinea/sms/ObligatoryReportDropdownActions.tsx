import { useDeleteObligatoryReport } from "@/actions/sms/reporte_obligatorio/actions";
import { PdfEndpointPreviewDialog } from "@/components/dialogs/shared/PdfEndpointPreviewDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ObligatoryReport } from "@/types";
import {
  CheckCheck,
  ClipboardPen,
  ClipboardPenLine,
  EyeIcon,
  FileText,
  Loader2,
  MoreHorizontal,
  PrinterCheck,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import CreateDangerIdentificationForm from "@/components/forms/aerolinea/sms/CreateIdentificationForm";
import { CreateObligatoryReportForm } from "@/components/forms/aerolinea/sms/CreateObligatoryReportForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Button } from "@/components/ui/button";
import { AcceptObligatoryReport } from "@/components/forms/aerolinea/sms/AcceptObligatoryForm";

const ObligatoryReportDropdownActions = ({
  obligatoryReport,
}: {
  obligatoryReport: ObligatoryReport;
}) => {
  const { selectedCompany } = useCompanyStore();
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [openCreateDangerIdentification, setOpenCreateDangerIdentification] =
    useState<boolean>(false);
  const [openEdit, setOpenEdit] = useState<boolean>(false);
  const [openAccept, setOpenAccept] = useState<boolean>(false);
  const [openFormatPdf, setOpenFormatPdf] = useState<boolean>(false);
  const [openManagementPdf, setOpenManagementPdf] = useState<boolean>(false);

  const router = useRouter();

  const { deleteObligatoryReport } = useDeleteObligatoryReport();

  const hasCompanySlug = Boolean(selectedCompany?.slug);

  const formatPdfEndpoint = hasCompanySlug
    ? `/${selectedCompany!.slug}/sms/obligatory-reports/${obligatoryReport.id}/format-pdf`
    : "";

  const managementPdfEndpoint = hasCompanySlug
    ? `/${selectedCompany!.slug}/sms/obligatory-reports/${obligatoryReport.id}/management-pdf`
    : "";

  const handleDelete = async (id: number | string) => {
    const value = {
      company: selectedCompany!.slug,
      id: id.toString(),
    };
    await deleteObligatoryReport.mutateAsync(value);
    setOpenDelete(false);
  };
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="center" className="flex flex-row gap-2 p-2">
          <TooltipProvider>
            {obligatoryReport.status === "ABIERTO" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem onClick={() => setOpenEdit(true)}>
                    <ClipboardPen className="size-4" />
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>Editar</TooltipContent>
              </Tooltip>
            )}

            {obligatoryReport.status === "PROCESO" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem onClick={() => setOpenAccept(true)}>
                    <CheckCheck className="size-4 text-green-400" />
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>Aceptar</TooltipContent>
              </Tooltip>
            )}

            {(obligatoryReport.status === "ABIERTO" ||
              obligatoryReport.status === "PROCESO") && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem onClick={() => setOpenDelete(true)}>
                    <Trash2 className="size-4 text-red-500" />
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>Eliminar</TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuItem
                  onClick={() => {
                    router.push(
                      `/transmandu/sms/reportes/reportes_obligatorios/${obligatoryReport.id}`,
                    );
                  }}
                >
                  <EyeIcon className="size-4" />
                </DropdownMenuItem>
              </TooltipTrigger>
              <TooltipContent>Ver</TooltipContent>
            </Tooltip>

            {obligatoryReport?.danger_identification?.id === null &&
              obligatoryReport?.status === "ABIERTO" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuItem
                      onClick={() => setOpenCreateDangerIdentification(true)}
                    >
                      <ClipboardPenLine className="size-4" />
                    </DropdownMenuItem>
                  </TooltipTrigger>
                  <TooltipContent>Crear Identificación</TooltipContent>
                </Tooltip>
              )}

            {obligatoryReport && formatPdfEndpoint && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem onSelect={() => setOpenFormatPdf(true)}>
                    <PrinterCheck className="size-4" />
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>PDF formato</TooltipContent>
              </Tooltip>
            )}

            {obligatoryReport && managementPdfEndpoint && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem onSelect={() => setOpenManagementPdf(true)}>
                    <FileText className="size-4" />
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>PDF gestión</TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </DropdownMenuContent>
      </DropdownMenu>

      {obligatoryReport && formatPdfEndpoint && (
        <PdfEndpointPreviewDialog
          open={openFormatPdf}
          onOpenChange={setOpenFormatPdf}
          endpoint={formatPdfEndpoint}
          fileName={`TMD_FOR_SMS_REPORTE_OBLIGATORIO_DE_SUCESOS_${obligatoryReport.report_number || obligatoryReport.id}`}
          title="Vista previa del formato del reporte"
          description="Revisa el formato del reporte antes de descargarlo."
        />
      )}

      {obligatoryReport && managementPdfEndpoint && (
        <PdfEndpointPreviewDialog
          open={openManagementPdf}
          onOpenChange={setOpenManagementPdf}
          endpoint={managementPdfEndpoint}
          fileName={`TMD_GESTION_RIESGO_${obligatoryReport.report_number || obligatoryReport.id}`}
          title="Vista previa del reporte de gestión"
          description="Revisa el reporte de gestión antes de descargarlo."
        />
      )}

      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">
              ¿Seguro que desea eliminar el reporte?
            </DialogTitle>
            <DialogDescription className="text-center p-2 mb-0 pb-0">
              Esta acción es irreversible y estaría eliminando por completo el
              reporte seleccionado.
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
              disabled={deleteObligatoryReport.isPending}
              className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
              onClick={() => {
                if (obligatoryReport.id) {
                  handleDelete(obligatoryReport.id);
                }
              }}
            >
              {deleteObligatoryReport.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <p>Confirmar</p>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="flex flex-col max-w-2xl m-2">
          <DialogHeader>
            <DialogTitle className="text-center"></DialogTitle>
            <CreateObligatoryReportForm
              initialData={obligatoryReport}
              isEditing={true}
              onClose={() => setOpenEdit(false)}
            />
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog open={openAccept} onOpenChange={setOpenAccept}>
        <DialogContent className="flex flex-col max-w-2xl m-2">
          <DialogHeader>
            <DialogTitle className="text-center"></DialogTitle>
            <AcceptObligatoryReport
              initialData={obligatoryReport}
              onClose={() => setOpenAccept(false)}
            ></AcceptObligatoryReport>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openCreateDangerIdentification}
        onOpenChange={setOpenCreateDangerIdentification}
      >
        <DialogContent className="flex flex-col max-w-2xl m-2">
          <DialogHeader>
            <DialogTitle></DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>

          {obligatoryReport.id && (
            <CreateDangerIdentificationForm
              id={obligatoryReport.id}
              reportType="ROS"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ObligatoryReportDropdownActions;
