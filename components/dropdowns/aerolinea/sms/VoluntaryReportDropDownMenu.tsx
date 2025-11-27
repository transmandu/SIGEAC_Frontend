import { useDeleteVoluntaryReport } from "@/actions/sms/reporte_voluntario/actions";
import { AcceptVoluntaryReport } from "@/components/forms/aerolinea/sms/AcceptVoluntaryForm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetDangerIdentificationWithAllById } from "@/hooks/sms/useGetDangerIdentificationWithAllById";
import { useCompanyStore } from "@/stores/CompanyStore";
import { VoluntaryReport } from "@/types";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { format } from "date-fns";
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
import { CreateVoluntaryReportForm } from "@/components/forms/aerolinea/sms/CreateVoluntaryReportForm";
import VoluntaryReportPdf from "@/components/pdf/sms/VoluntaryReportPdf";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const VoluntaryReportDropdownActions = ({
  voluntaryReport,
}: {
  voluntaryReport: VoluntaryReport;
}) => {
  const { selectedCompany } = useCompanyStore();

  const [open, setOpen] = useState<boolean>(false);
  const [openPDF, setOpenPDF] = useState<boolean>(false);
  const [openEdit, setOpenEdit] = useState<boolean>(false);
  const [openAccept, setOpenAccept] = useState<boolean>(false);
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const { deleteVoluntaryReport } = useDeleteVoluntaryReport();
  const router = useRouter();

  const { data: dangerIdentification } = useGetDangerIdentificationWithAllById({
    company: selectedCompany?.slug,
    id: voluntaryReport?.danger_identification_id?.toString(),
  });

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
      <Dialog open={open} onOpenChange={setOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger>
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
                <DialogTrigger asChild>
                  <DropdownMenuItem onClick={() => setOpenDelete(true)}>
                    <Trash2 className="size-5 text-red-500" />
                    <p className="pl-2">Eliminar</p>
                  </DropdownMenuItem>
                </DialogTrigger>
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

            {voluntaryReport && voluntaryReport.status !== "PROCESO" && (
              <DropdownMenuItem onClick={() => setOpenPDF(true)}>
                <PrinterCheck className="size-5" />
                <p className="pl-2">Descargar PDF</p>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* PDF Viewer */}
        <Dialog open={openPDF} onOpenChange={setOpenPDF}>
          <DialogContent className="sm:max-w-[65%] max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Vista Previa del Reporte</DialogTitle>
              <DialogDescription>
                Revisa el reporte antes de descargarlo.
              </DialogDescription>
            </DialogHeader>
            <div className="w-full h-screen">
              {voluntaryReport &&
              voluntaryReport.status === "CERRADO" &&
              dangerIdentification ? (
                <PDFViewer style={{ width: "100%", height: "60%" }}>
                  <VoluntaryReportPdf
                    report={voluntaryReport}
                    identification={dangerIdentification}
                  />
                </PDFViewer>
              ) : (
                <PDFViewer style={{ width: "100%", height: "60%" }}>
                  <VoluntaryReportPdf report={voluntaryReport} />
                </PDFViewer>
              )}
            </div>

            <div className="flex justify-end mt-4">
              <PDFDownloadLink
                fileName={`reporte_sms_${format(new Date(), "dd-MM-yyyy")}.pdf`}
                document={<VoluntaryReportPdf report={voluntaryReport} />}
              >
                <Button>Descargar Reporte</Button>
              </PDFDownloadLink>
            </div>
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
      </Dialog>
    </>
  );
};

export default VoluntaryReportDropdownActions;
