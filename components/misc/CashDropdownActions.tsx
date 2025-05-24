import { useDeleteCash } from "@/actions/administracion/cajas/actions";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Cash } from "@/types";
import { EyeIcon, Loader2, MoreHorizontal, Trash2, TrendingUp, } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "../ui/dialog";
import { getCurrencySymbol } from "@/lib/utils";

const CashDropdownActions = ({ id, cash }: { id: string; cash: Cash }) => {
  const [openCash, setOpenCash] = useState<boolean>(false);
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const router = useRouter();
  const { deleteCash } = useDeleteCash();

  const handleDelete = (id: number | string) => {
    deleteCash.mutate(id, {
      onSuccess: () => setOpenDelete(false), // Cierra el modal solo si la eliminación fue exitosa
    });
  };

  const handleViewDetails = () => {
    setOpenCash(true);
  };

  const handleViewStats = () => {
    router.push(`/transmandu/administracion/gestion_cajas/cajas/${id}`);
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
          {/*Redirige a la page para ver las estadisticas de una caja segun la cuenta*/}
          <DropdownMenuItem onClick={handleViewStats}>
            <TrendingUp className="size-5 text-green-500" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/*Dialog para eliminar una caja*/}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault(); // Evita que el diálogo se cierre al hacer clic fuera
          }}
          aria-describedby={undefined} 
        >
          <DialogHeader>
            <DialogTitle className="text-center">
              ¿Seguro que desea eliminar la caja?
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
              disabled={deleteCash.isPending}
              className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
              onClick={() => handleDelete(id)}
            >
              {deleteCash.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <p>Confirmar</p>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/*Dialog para mostrar el resumen de una caja*/}
      <Dialog open={openCash} onOpenChange={setOpenCash}>
        <DialogContent
          className="sm:max-w-md rounded-lg"
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
          <DialogHeader className="text-center font-bold">
            Resumen de la Caja
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-500">Nombre</p>
                <p className="text-lg font-semibold text-gray-800">
                  {cash.name}
                </p>
              </div>
              <div className="bg-primary/10 px-3 py-1 rounded-full">
                <p className="text-sm font-medium text-primary">{cash.coin}</p>
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Transacción
                  </p>
                  <p className="text-xl font-bold text-green-800">
                    {cash.type}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">
                    Saldo Total
                  </p>
                  <p className="text-xl font-bold text-green-800">
                    {getCurrencySymbol(cash.coin)} {cash.total_amount}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button
              onClick={() => setOpenCash(false)}
              variant="outline"
              className="w-full"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CashDropdownActions;
