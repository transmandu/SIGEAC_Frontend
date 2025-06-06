import { useDeleteFollowUpControl } from "@/actions/sms/controles_de_seguimiento/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FollowUpControl
} from "@/types";
import {
  ClipboardPenLine,
  Loader2,
  MoreHorizontal,
  Trash2
} from "lucide-react";
import { useState } from "react";
import { EditFollowUpControlForm } from "../forms/EditFollowUpControlForm";
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

const FollowUpControlDropdownActions = ({
  followUpControl,
}: {
  followUpControl: FollowUpControl;
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [openEdit, setOpenEdit] = useState<boolean>(false);

  const { deleteFollowUpControl } = useDeleteFollowUpControl();
  const [openCreateFollowUpControl, setOpenCreateFollowUpControl] =
    useState<boolean>(false);

  const [openDelete, setOpenDelete] = useState<boolean>(false);

  const handleDelete = async (id: number | string) => {
    await deleteFollowUpControl.mutateAsync(id);
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
            <DialogTrigger asChild>
              <DropdownMenuItem onClick={() => setOpenDelete(true)}>
                <Trash2 className="size-5 text-red-500" />
                <p className="pl-2">Eliminar</p>
              </DropdownMenuItem>
            </DialogTrigger>

            {
              <DropdownMenuItem onClick={() => setOpenEdit(true)}>
                <ClipboardPenLine className="size-5" />
                <p className="pl-2">Editar</p>
              </DropdownMenuItem>
            }
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={openDelete} onOpenChange={setOpenDelete}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-center">
                ¿Seguro que desea eliminar el reporte??
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
                disabled={deleteFollowUpControl.isPending}
                className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
                onClick={() => handleDelete(followUpControl.id)}
              >
                {deleteFollowUpControl.isPending ? (
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
              <DialogTitle></DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>

            <EditFollowUpControlForm
              onClose={() => setOpenEdit(false)}
              initialData={followUpControl}
            />
          </DialogContent>
        </Dialog>
      </Dialog>
    </>
  );
};

export default FollowUpControlDropdownActions;
