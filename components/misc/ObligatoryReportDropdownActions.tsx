import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ObligatoryReport } from "@/types";
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
import { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useDeleteObligatoryReport } from "@/actions/sms/reporte_obligatorio/actions";
import { useRouter } from "next/navigation";
import { CreateObligatoryReportForm } from "../forms/CreateObligatoryReportForm";
import CreateDangerIdentificationForm from "../forms/CreateIdentificationForm";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import ObligatoryReportPdf from "../pdf/sms/ObligatoryReportPdf";
import { format } from "date-fns";
import VoluntaryReportPdf from "../pdf/sms/VoluntaryReportPdf";
import { useGetDangerIdentificationWithAllById } from "@/hooks/sms/useGetDangerIdentificationWithAllById";
import { AcceptObligatoryReport } from "../forms/AcceptObligatoryForm";

const ObligatoryReportDropdownActions = ({
  obligatoryReport,
}: {
  obligatoryReport: ObligatoryReport;
}) => {
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [openCreateDangerIdentification, setOpenCreateDangerIdentification] =
    useState<boolean>(false);
  const [openEdit, setOpenEdit] = useState<boolean>(false);
  const [openAccept, setOpenAccept] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [openPrint, setOpenPrint] = useState<boolean>(false);

  const router = useRouter();

  const { deleteObligatoryReport } = useDeleteObligatoryReport();

  const { data: dangerIdentification } = useGetDangerIdentificationWithAllById(
    obligatoryReport.danger_identification.id
  );
  const handleDelete = async (id: number | string) => {
    await deleteObligatoryReport.mutateAsync(id);
    setOpenDelete(false);
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
            {/*Este es el primer icon ode edit */}

            {obligatoryReport.status === "ABIERTO" && (
              <DropdownMenuItem onClick={() => setOpenEdit(true)}>
                <ClipboardPen className="size-5" />
                <p className="pl-2"> Editar </p>
              </DropdownMenuItem>
            )}

            {obligatoryReport.status === "PROCESO" && (
              <DropdownMenuItem onClick={() => setOpenAccept(true)}>
                <CheckCheck className="size-5 text-green-400" />
                <p className="pl-2 "> Aceptar </p>
              </DropdownMenuItem>
            )}

            {(obligatoryReport.status === "ABIERTO" ||
              obligatoryReport.status === "PROCESO") && (
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
                  `/transmandu/sms/reportes_obligatorios/${obligatoryReport.id}`
                );
              }}
            >
              <EyeIcon className="size-5" />
              <p className="pl-2"> Ver </p>
            </DropdownMenuItem>

            {!obligatoryReport.danger_identification.id &&
              obligatoryReport.status === "ABIERTO" && (
                <DropdownMenuItem
                  onClick={() => setOpenCreateDangerIdentification(true)}
                >
                  <ClipboardPenLine className="size-5" />
                  <p className="pl-2"> Crear Identificacion </p>
                </DropdownMenuItem>
              )}

            {obligatoryReport && (
              <DropdownMenuItem onClick={() => setOpenPrint(true)}>
                <PrinterCheck className="size-5" />
                <p className="pl-2"> Descargar PDF</p>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

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
                onClose={() => setOpenCreateDangerIdentification(false)}
                id={obligatoryReport.id}
                reportType="ROS"
              />
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={openPrint} onOpenChange={setOpenPrint}>
          <DialogContent className="sm:max-w-[65%] max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Vista Previa del Reporte</DialogTitle>
              <DialogDescription>
                Revisa el reporte antes de descargarlo.
              </DialogDescription>
            </DialogHeader>
            <div className="w-full h-screen">
              {obligatoryReport && dangerIdentification ? (
                <PDFViewer style={{ width: "100%", height: "60%" }}>
                  <ObligatoryReportPdf
                    report={obligatoryReport}
                    identification={dangerIdentification}
                  />
                </PDFViewer>
              ) : (
                <>
                  <PDFViewer style={{ width: "100%", height: "60%" }}>
                    <ObligatoryReportPdf report={obligatoryReport} />
                  </PDFViewer>
                </>
              )}
            </div>
            <div className="flex justify-end mt-4">
              <PDFDownloadLink
                fileName={`reporte_diario_${format(
                  new Date(),
                  "dd-MM-yyyy"
                )}.pdf`}
                document={<ObligatoryReportPdf report={obligatoryReport} />}
              >
                <Button>Descargar Reporte</Button>
              </PDFDownloadLink>
            </div>
          </DialogContent>
        </Dialog>
      </Dialog>
    </>
  );
};

export default ObligatoryReportDropdownActions;
