import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { EyeIcon, Loader2, MoreHorizontal, Trash2, } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { useDeleteCashMovement } from "@/actions/aerolinea/movimientos/actions";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "../ui/dialog";
import { CashMovement } from "@/types";
import CashMovementResume from "./CashMovementResume";

const CashMovementDropdownActions = ({
  movement,
}: {
  movement: CashMovement;
}) => {
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [openCashMovement, setOpenCashMovement] = useState<boolean>(false);
  const router = useRouter();
  const { deleteCashMovement } = useDeleteCashMovement();

  const handleDelete = (id: number | string) => {
    deleteCashMovement.mutate(id, {
      onSuccess: () => setOpenDelete(false), // Cierra el modal solo si la eliminación fue exitosa
    });
  };

  const handleViewDetails = () => {
    setOpenCashMovement(true);
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
          <DropdownMenuItem onClick={handleViewDetails}>
            <EyeIcon className="size-5" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/*Dialog para eliminar un movimiento*/}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault(); // Evita que el diálogo se cierre al hacer clic fuera
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-center">
              ¿Seguro que desea eliminar el movimiento?
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
              disabled={deleteCashMovement.isPending}
              className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
              onClick={() => handleDelete(movement.id)}
            >
              {deleteCashMovement.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <p>Confirmar</p>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/*Dialog para mostar el resumen del movimiento de una caja*/}
      <Dialog open={openCashMovement} onOpenChange={setOpenCashMovement}>
        <DialogContent className="sm:max-w-xl" onInteractOutside={(e) => e.preventDefault()} aria-describedby={undefined}>
          <CashMovementResume movement={movement} />
          <DialogFooter className="sm:justify-center">
            <Button onClick={() => setOpenCashMovement(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CashMovementDropdownActions;
