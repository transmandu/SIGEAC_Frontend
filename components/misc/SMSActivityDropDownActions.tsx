import { useDeleteSMSActivity } from "@/actions/sms/sms_actividades/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SMSActivity } from "@/types";
import {
  ClipboardPen,
  EyeIcon,
  Loader2,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import CreateSMSActivityForm from "../forms/CreateSMSActivityForm";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { AddToSMSActivity } from "../forms/AddToSMSActivityForm";

const SMSActivityDropDownActions = ({
  smsActivity,
}: {
  smsActivity: SMSActivity;
}) => {
  const [openDelete, setOpenDelete] = useState<boolean>(false);

  const [openEdit, setOpenEdit] = useState<boolean>(false);

  const [openAdd, setOpenAdd] = useState(false);

  const [show, setOpenShow] = useState(false);

  const { deleteSMSActivity } = useDeleteSMSActivity();

  const handleDelete = async (id: number | string) => {
    await deleteSMSActivity.mutateAsync(id);
    setOpenDelete(false);
  };
  return (
    <>
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
          <DropdownMenuItem onClick={() => setOpenDelete(true)}>
            <Trash2 className="size-5 text-red-500" />
            <p className="pl-2">Eliminar</p>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setOpenEdit(true)}>
            <ClipboardPen className="size-5" />
            <p className="pl-2">Editar</p>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setOpenShow(true)}>
            <EyeIcon className="size-5" />
            <p className="pl-2">Ver</p>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setOpenAdd(true)}>
            <Plus className="size-5" />
            <p className="pl-2">Agregar personas</p>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* DIALOGO DE ELIMINAR */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">
              ¿Seguro que desea eliminar la actividad?
            </DialogTitle>
            <DialogDescription className="text-center p-2 mb-0 pb-0">
              Esta acción es irreversible y estaría eliminando por completo la
              actividad seleccionada.
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
              disabled={deleteSMSActivity.isPending}
              className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
              onClick={() => handleDelete(smsActivity.id)}
            >
              {deleteSMSActivity.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <p>Confirmar</p>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOGO DE EDITAR */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="flex flex-col max-w-2xl m-2">
          <DialogHeader>
            <DialogTitle className="text-center">
              Edicion de Actividad
            </DialogTitle>
            <DialogDescription className="text-center"></DialogDescription>
            <CreateSMSActivityForm
              initialData={smsActivity}
              isEditing={true}
              onClose={() => setOpenEdit(false)}
            />
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* DIALOGO DE ADD FORM */}
      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent className="flex flex-col max-w-2xl m-2">
          <DialogHeader>
            <DialogTitle className="text-center font-light">
              Agregar o eliminar personas
            </DialogTitle>
            <DialogDescription className="text-center"></DialogDescription>
            <AddToSMSActivity
              initialData={smsActivity}
              onClose={() => setOpenAdd(false)}
            />
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SMSActivityDropDownActions;
