import { useDeleteAccount } from "@/actions/aerolinea/cuentas/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Accountant } from "@/types";
import { EditIcon, Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import { EditAccountantForm } from "../forms/EditAccountForm";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

const AccountantDropdownActions = ({
  accountant,
}: {
  accountant: Accountant;
}) => {
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const { deleteAccount } = useDeleteAccount();
  const [openEdit, setOpenEdit] = useState<boolean>(false);

  const handleDelete = (id: number | string) => {
    deleteAccount.mutate(id, {
      onSuccess: () => setOpenDelete(false),
    });
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
          className="flex gap-2 justify-center"
        >
          <DropdownMenuItem onClick={() => setOpenDelete(true)}>
            <Trash2 className="size-5 text-red-500" />
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenEdit(true)}>
            <EditIcon className="size-5 text-blue-500" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/*Dialog para eliminar una cuenta*/}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-center">
              ¿Seguro que desea eliminar la cuenta?
            </DialogTitle>
            <DialogDescription className="text-center p-2 mb-0 pb-0">
              Esta acción es irreversible y estaría eliminando por completo el
              permiso seleccionado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              className="bg-rose-400 hover:bg-white hover:text-black hover:border hover:border-black"
              onClick={() => setOpenDelete(false)}
              type="submit"
            >
              Cancelar
            </Button>
            <Button
              disabled={deleteAccount.isPending}
              className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
              onClick={() => handleDelete(accountant.id)}
            >
              {deleteAccount.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <p>Confirmar</p>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/*Dialog para editar la cuenta*/}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>Editar Cuenta</DialogTitle>
          </DialogHeader>
          <EditAccountantForm
            accountant={accountant}
            onClose={() => setOpenEdit(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AccountantDropdownActions;
