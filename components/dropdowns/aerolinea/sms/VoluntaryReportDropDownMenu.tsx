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
import { useCompanyStore } from "@/stores/CompanyStore";
import { VoluntaryReport } from "@/types";
import {
  CheckCheck,
  ClipboardPen,
  ClipboardPenLine,
  EyeIcon,
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
  const [openPdf, setOpenPdf] = useState<boolean>(false);
  const { deleteVoluntaryReport } = useDeleteVoluntaryReport();
  const router = useRouter();

  const useManagementPdf =
    voluntaryReport.status === "CERRADO" &&
    Boolean(voluntaryReport.danger_identification_id);

  const pdfEndpoint = selectedCompany?.slug
    ? `/${selectedCompany.slug}/sms/voluntary-reports/${voluntaryReport.id}/${useManagementPdf ? "management-pdf" : "format-pdf"}`
    : "";

  const pdfTitle = useManagementPdf
    ? "Vista previa del reporte de gestión"
    : "Vista previa del formato del reporte";

  const pdfDescription = useManagementPdf
    ? "Revisa el reporte de gestión antes de descargarlo."
    : "Revisa el formato del reporte antes de descargarlo.";

  const handleDelete = async (id: number | string) => {
    const value = {
      company: selectedCompany!.slug,
      id: id.toString(),
    };
    await deleteVoluntaryReport.mutateAsync(value);
    setOpenDelete(false);
  };

  // ✅ Nueva función para redirigir enviando el ID del reporte
  const handleCreateIdentification = () => {
    router.push(
      `/transmandu/sms/gestion_reportes/peligros_identificados/crear_identificacion?reporteId=${voluntaryReport.id}`
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

        <DropdownMenuContent
          align="center"
          className="flex-col gap-2 justify-center"
        >
          {voluntaryReport && voluntaryReport.status === "ABIERTO" && (
            <DropdownMenuItem onClick={() => setOpenEdit(true)}>
              <ClipboardPen className="size-5" />
              <p className="pl-2">Editar</p>
            </DropdownMenuItem>
          )}

          {voluntaryReport && voluntaryReport.status === "PROCESO" && (
            <DropdownMenuItem onClick={() => setOpenAccept(true)}>
              <CheckCheck className="size-5 text-green-400" />
              <p className="pl-2">Aceptar</p>
            </DropdownMenuItem>
          )}

          {voluntaryReport &&
            (voluntaryReport.status === "ABIERTO" ||
              voluntaryReport.status === "PROCESO") && (
              <DropdownMenuItem onClick={() => setOpenDelete(true)}>
                <Trash2 className="size-5 text-red-500" />
                <p className="pl-2">Eliminar</p>
              </DropdownMenuItem>
            )}

          <DropdownMenuItem
            onClick={() => {
              router.push(
                `/transmandu/sms/reportes/reportes_voluntarios/${voluntaryReport.id}`
              );
            }}
          >
            <EyeIcon className="size-5" />
            <p className="pl-2">Ver</p>
          </DropdownMenuItem>

          {/* ✅ Modificación: redirige enviando el ID como query param */}
          {!voluntaryReport.danger_identification_id &&
            voluntaryReport.status === "ABIERTO" && (
              <DropdownMenuItem onClick={handleCreateIdentification}>
                <ClipboardPenLine className="size-5" />
                <p className="pl-2">Crear Identificación</p>
              </DropdownMenuItem>
            )}

          {voluntaryReport && voluntaryReport.status !== "PROCESO" && pdfEndpoint && (
            <DropdownMenuItem onSelect={() => setOpenPdf(true)}>
              <PrinterCheck className="size-5" />
              <p className="pl-2">PDF</p>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {voluntaryReport && pdfEndpoint && (
        <PdfEndpointPreviewDialog
          open={openPdf}
          onOpenChange={setOpenPdf}
          endpoint={pdfEndpoint}
          fileName={`reporte_sms_${voluntaryReport.id}`}
          title={pdfTitle}
          description={pdfDescription}
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
