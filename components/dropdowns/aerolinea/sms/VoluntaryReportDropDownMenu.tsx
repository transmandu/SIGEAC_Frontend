import { useDeleteVoluntaryReport } from "@/actions/sms/reporte_voluntario/actions";
import { AcceptVoluntaryReport } from "@/components/forms/aerolinea/sms/AcceptVoluntaryForm";
import { CreateVoluntaryReportForm } from "@/components/forms/aerolinea/sms/CreateVoluntaryReportForm";
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
import { useCompanyStore } from "@/stores/CompanyStore";
import { VoluntaryReport } from "@/types";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const VoluntaryReportDropdownActions = ({
  voluntaryReport,
}: {
  voluntaryReport: VoluntaryReport;
}) => {
  const { selectedCompany } = useCompanyStore();

  const [openEdit, setOpenEdit] = useState<boolean>(false);
  const [openAccept, setOpenAccept] = useState<boolean>(false);
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [openFormatPdf, setOpenFormatPdf] = useState<boolean>(false);
  const [openManagementPdf, setOpenManagementPdf] = useState<boolean>(false);
  const { deleteVoluntaryReport } = useDeleteVoluntaryReport();
  const router = useRouter();

  const hasCompanySlug = Boolean(selectedCompany?.slug);

  const formatPdfEndpoint = hasCompanySlug
    ? `/${selectedCompany!.slug}/sms/voluntary-reports/${voluntaryReport.id}/format-pdf`
    : "";

  const managementPdfEndpoint = hasCompanySlug
    ? `/${selectedCompany!.slug}/sms/voluntary-reports/${voluntaryReport.id}/management-pdf`
    : "";

  const handleDelete = async (id: number | string) => {
    const value = {
      company: selectedCompany!.slug,
      id: id.toString(),
    };
    await deleteVoluntaryReport.mutateAsync(value);
    setOpenDelete(false);
  };

  const handleCreateIdentification = () => {
    router.push(
      `/transmandu/sms/gestion_reportes/peligros_identificados/crear_identificacion?reporteId=${voluntaryReport.id}`,
    );
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
            {voluntaryReport && voluntaryReport.status === "ABIERTO" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem onClick={() => setOpenEdit(true)}>
                    <ClipboardPen className="size-4" />
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>Editar</TooltipContent>
              </Tooltip>
            )}

            {voluntaryReport && voluntaryReport.status === "PROCESO" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem onClick={() => setOpenAccept(true)}>
                    <CheckCheck className="size-4 text-green-400" />
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>Aceptar</TooltipContent>
              </Tooltip>
            )}

            {voluntaryReport &&
              (voluntaryReport.status === "ABIERTO" ||
                voluntaryReport.status === "PROCESO") && (
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
                      `/transmandu/sms/reportes/reportes_voluntarios/${voluntaryReport.id}`,
                    );
                  }}
                >
                  <EyeIcon className="size-4" />
                </DropdownMenuItem>
              </TooltipTrigger>
              <TooltipContent>Ver</TooltipContent>
            </Tooltip>

            {voluntaryReport &&
              !voluntaryReport.danger_identification_id &&
              voluntaryReport.status === "ABIERTO" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuItem onClick={handleCreateIdentification}>
                      <ClipboardPenLine className="size-4" />
                    </DropdownMenuItem>
                  </TooltipTrigger>
                  <TooltipContent>Crear Identificación</TooltipContent>
                </Tooltip>
              )}

            {voluntaryReport && formatPdfEndpoint && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem onSelect={() => setOpenFormatPdf(true)}>
                    <PrinterCheck className="size-4" />
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>PDF formato</TooltipContent>
              </Tooltip>
            )}

            {voluntaryReport && managementPdfEndpoint && (
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

      {voluntaryReport && formatPdfEndpoint && (
        <PdfEndpointPreviewDialog
          open={openFormatPdf}
          onOpenChange={setOpenFormatPdf}
          endpoint={formatPdfEndpoint}
          fileName={`reporte_sms_${voluntaryReport.id}`}
          title="Vista previa del formato del reporte"
          description="Revisa el formato del reporte antes de descargarlo."
        />
      )}

      {voluntaryReport && managementPdfEndpoint && (
        <PdfEndpointPreviewDialog
          open={openManagementPdf}
          onOpenChange={setOpenManagementPdf}
          endpoint={managementPdfEndpoint}
          fileName={`TMD_GESTION_RIESGO_${voluntaryReport.id}`}
          title="Vista previa del reporte de gestión"
          description="Revisa el reporte de gestión antes de descargarlo."
        />
      )}

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
              onClick={() => handleDelete(voluntaryReport.id)}
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

      {/* Edit dialog */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="flex flex-col max-w-3xl max-h-[calc(100vh-10rem)] m-2 overflow-auto">
          <DialogHeader />
          <CreateVoluntaryReportForm
            onClose={() => setOpenEdit(false)}
            initialData={voluntaryReport}
            isEditing={true}
          />
        </DialogContent>
      </Dialog>

      {/* Accept dialog */}
      <Dialog open={openAccept} onOpenChange={setOpenAccept}>
        <DialogContent className="flex flex-col w-2xs m-2">
          <DialogHeader />
          <AcceptVoluntaryReport
            onClose={() => setOpenAccept(false)}
            initialData={voluntaryReport}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VoluntaryReportDropdownActions;
