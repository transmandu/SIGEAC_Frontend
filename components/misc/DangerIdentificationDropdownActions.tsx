import { useDeleteDangerIdentification } from "@/actions/sms/peligros_identificados/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DangerIdentification } from "@/types";
import {
  ClipboardPen,
  ClipboardPenLine,
  EyeIcon,
  Loader2,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import CreateAnalysisForm from "../forms/CreateAnalysisForm";
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
import CreateDangerIdentificationForm from "../forms/CreateIdentificationForm";

const DangerIdentificationDropdownActions = ({
  dangerIdentification,
}: {
  dangerIdentification: DangerIdentification;
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [openEdit, setOpenEdit] = useState<boolean>(false);
  const [openEditAnalyses, setOpenEditAnalyses] = useState<boolean>(false);

  const { deleteDangerIdentification } = useDeleteDangerIdentification();
  const [openCreateAnalysis, setOpenCreateAnalysis] = useState<boolean>(false);
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const router = useRouter();

  const handleDelete = async (id: number | string) => {
    await deleteDangerIdentification.mutateAsync(id);
    setOpenDelete(false);
  };

  const status =
    dangerIdentification.voluntary_report?.status ||
    dangerIdentification.obligatory_report?.status;

  const id =
    dangerIdentification.voluntary_report?.id ||
    dangerIdentification.obligatory_report?.id ||
    "";

  const reportType = dangerIdentification.voluntary_report ? "RVP" : "ROS";

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
            {dangerIdentification && status === "ABIERTO" && (
              <DropdownMenuItem onClick={() => setOpenEdit(true)}>
                <ClipboardPen className="size-5" />
                <p className="pl-2">Editar</p>
              </DropdownMenuItem>
            )}

            {dangerIdentification &&
            reportType === "RVP" &&
            status === "ABIERTO" ? (
              <DialogTrigger asChild>
                <DropdownMenuItem onClick={() => setOpenDelete(true)}>
                  <Trash2 className="size-5 text-red-500" />
                  <p className="pl-2">Eliminar</p>
                </DropdownMenuItem>
              </DialogTrigger>
            ) : (
              dangerIdentification &&
              reportType === "ROS" &&
              status === "ABIERTO" && (
                <DialogTrigger asChild>
                  <DropdownMenuItem onClick={() => setOpenDelete(true)}>
                    <Trash2 className="size-5 text-red-500" />
                    <p className="pl-2">Eliminar</p>
                  </DropdownMenuItem>
                </DialogTrigger>
              )
            )}
            <DropdownMenuItem
              onClick={() => {
                router.push(
                  `/transmandu/sms/peligros_identificados/${dangerIdentification.id}`
                );
              }}
            >
              <EyeIcon className="size-5" />
              <p className="pl-2">Ver</p>
            </DropdownMenuItem>

            {dangerIdentification && !dangerIdentification.analysis && (
              <DropdownMenuItem onClick={() => setOpenCreateAnalysis(true)}>
                <ClipboardPenLine className="size-5" />
                <p className="pl-2">Crear Analisis</p>
              </DropdownMenuItem>
            )}

            {dangerIdentification &&
              dangerIdentification.analysis &&
              status !== "CERRADO" && (
                <DropdownMenuItem onClick={() => setOpenEditAnalyses(true)}>
                  <ClipboardPenLine className="size-5" />
                  <p className="pl-2">Editar Analisis</p>
                </DropdownMenuItem>
              )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={openDelete} onOpenChange={setOpenDelete}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-center">
                ¿Seguro que desea eliminar el reporte??
              </DialogTitle>
              <DialogDescription className="text-center p-2 mb-0 pb-0">
                Esta acción es irreversible y estaría eliminando por completo la
                identificacion seleccionado.
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
                disabled={deleteDangerIdentification.isPending}
                className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
                onClick={() => handleDelete(dangerIdentification.id)}
              >
                {deleteDangerIdentification.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <p>Confirmar</p>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={openCreateAnalysis} onOpenChange={setOpenCreateAnalysis}>
          <DialogContent className="flex flex-col max-w-2xl m-2">
            <DialogHeader>
              <DialogTitle></DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>

            <CreateAnalysisForm
              onClose={() => setOpenCreateAnalysis(false)}
              id={dangerIdentification.id}
              name={"identification"}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={openEditAnalyses} onOpenChange={setOpenEditAnalyses}>
          <DialogContent className="flex flex-col max-w-2xl m-2">
            <DialogHeader>
              <DialogTitle></DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>

            <CreateAnalysisForm
              onClose={() => setOpenEditAnalyses(false)}
              id={dangerIdentification.id}
              name={"identification"}
              isEditing={true}
              initialData={dangerIdentification.analysis}
            />
          </DialogContent>
        </Dialog>
        <Dialog open={openEdit} onOpenChange={setOpenEdit}>
          <DialogContent className="flex flex-col max-w-2xl m-2">
            <DialogHeader>
              <DialogTitle className="text-center"></DialogTitle>
              {dangerIdentification.voluntary_report ? (
                <CreateDangerIdentificationForm
                  id={id}
                  initialData={dangerIdentification}
                  isEditing={true}
                  onClose={() => setOpenEdit(false)}
                  reportType={reportType}
                />
              ) : null}
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </Dialog>
    </>
  );
};

export default DangerIdentificationDropdownActions;
