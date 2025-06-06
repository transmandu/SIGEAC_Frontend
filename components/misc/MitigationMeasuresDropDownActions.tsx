import { useDeleteMitigationMeasure } from "@/actions/sms/medida_de_mitigacion/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MitigationMeasure } from "@/types";
import {
  ClipboardPenLine,
  Loader2,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import CreateFollowUpControlForm from "../forms/CreateFollowUpControlForm";
import CreateMitigationMeasureForm from "../forms/CreateMitigationMeasureForm";
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

const MitigationMeasureDropdownActions = ({
  mitigationMeasure,
}: {
  mitigationMeasure: MitigationMeasure;
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [openEdit, setOpenEdit] = useState<boolean>(false);

  const { deleteMitigationMeasure } = useDeleteMitigationMeasure();

  const [openCreateDangerIdentification, setOpenCreateDangerIdentification] =
    useState<boolean>(false);

  const [openCreateFollowUpControl, setOpenCreateFollowUpControl] =
    useState<boolean>(false);

  const [openDelete, setOpenDelete] = useState<boolean>(false);

  const handleDelete = async (id: number | string) => {
    await deleteMitigationMeasure.mutateAsync(id);
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
            className="flex-COL gap-2 justify-center"
          >
            {mitigationMeasure && (
              <DropdownMenuItem onClick={() => setOpenEdit(true)}>
                <ClipboardPenLine className="size-5" />
                <p className="pl-2"> Editar </p>
              </DropdownMenuItem>
            )}
            <DialogTrigger asChild>
              <DropdownMenuItem onClick={() => setOpenDelete(true)}>
                <Trash2 className="size-5 text-red-500" />
                <p className="pl-2"> Eliminar </p>
              </DropdownMenuItem>
            </DialogTrigger>

            <DialogTrigger asChild>
              <DropdownMenuItem
                onClick={() => setOpenCreateFollowUpControl(true)}
              >
                <Plus className="size-5 text-black" />
                <p className="pl-2">Crear Control</p>
              </DropdownMenuItem>
            </DialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={openDelete} onOpenChange={setOpenDelete}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-center">
                ¿Seguro que desea eliminar el control de seguimiento??
              </DialogTitle>
              <DialogDescription className="text-center p-2 mb-0 pb-0">
                Esta acción es irreversible y estaría eliminando por completo el
                control de seguimiento seleccionado.
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
                disabled={deleteMitigationMeasure.isPending}
                className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
                onClick={() => handleDelete(mitigationMeasure.id)}
              >
                {deleteMitigationMeasure.isPending ? (
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
              <CreateMitigationMeasureForm
                onClose={() => setOpenEdit(false)}
                id={mitigationMeasure.id}
                initialData={mitigationMeasure}
                isEditing={true}
              />
            </DialogHeader>
          </DialogContent>
        </Dialog>

        <Dialog
          open={openCreateFollowUpControl}
          onOpenChange={setOpenCreateFollowUpControl}
        >
          <DialogContent className="flex flex-col max-w-2xl m-2">
            <DialogHeader>
              <DialogTitle className="text-center"></DialogTitle>
              <CreateFollowUpControlForm
                onClose={() => setOpenCreateFollowUpControl(false)}
                id={mitigationMeasure.id}
              />
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </Dialog>
    </>
  );
};

export default MitigationMeasureDropdownActions;
