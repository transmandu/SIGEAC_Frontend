import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { EditIcon, Loader2, MoreHorizontal, Trash2, } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "../ui/dialog";
import { useDeleteRenting } from "@/actions/administracion/arrendamiento/actions";
import { DefineEndDateForm } from "../forms/DefineEndDateForm";
import { Renting } from "@/types";

const RentingDropdownActions = ({ rent }: { rent: Renting }) => {
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [openDefine, setOpenDefine] = useState<boolean>(false);
  const router = useRouter();
  const { deleteRenting } = useDeleteRenting();

  const handleDelete = (id: number | string) => {
    deleteRenting.mutate(id, {
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
          {rent.status === "CULMINADO" ? (
            <DropdownMenuItem disabled>
              <span className="text-green-500">Culminado</span>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setOpenDefine(true)}>
              <EditIcon className="size-5 text-blue-500" />
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setOpenDelete(true)}>
            <Trash2 className="size-5 text-red-500" />
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              router.push(`/administracion/renting/${rent.id}`);
            }}
          ></DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/*Dialog para eliminar el arrendamiento*/}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault(); // Evita que el diálogo se cierre al hacer clic fuera
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-center">
              ¿Seguro que desea eliminar el arrendamiento?
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
              disabled={deleteRenting.isPending}
              className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
              onClick={() => handleDelete(rent.id.toString())}
            >
              {deleteRenting.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <p>Confirmar</p>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/*Dialog para editar la fecha final end_date*/}
      <Dialog open={openDefine} onOpenChange={setOpenDefine}>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>Definir Fecha Final</DialogTitle>
          </DialogHeader>
          <DefineEndDateForm
            id={rent.id.toString()}
            onClose={() => setOpenDefine(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RentingDropdownActions;
