import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EyeIcon, Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { useDeleteSell } from "@/actions/administracion/ventas/actions";
import { useGetSellById } from "@/hooks/administracion/useGetSellById";

const SellDropdownActions = ({ id }: { id: string }) => {
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [openSells, setOpenSells] = useState<boolean>(false);
  const router = useRouter();
  const { deleteSell } = useDeleteSell();
  const { data: sellsDetails, isLoading } = useGetSellById(id);

  const handleDelete = (id: number | string) => {
    deleteSell.mutate(id, {
      onSuccess: () => setOpenDelete(false), // Cierra el modal solo si la eliminación fue exitosa
    });
  };

  const handleViewDetails = () => {
    setOpenSells(true);
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
          <DropdownMenuItem
            onClick={() => {
              router.push(`/administracion/ventas/${id}`);
            }}
          ></DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/*Dialog para eliminar el registro de la venta*/}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">
              ¿Seguro que desea eliminar el registro de la venta?
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
              disabled={deleteSell.isPending}
              className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
              onClick={() => handleDelete(id)}
            >
              {deleteSell.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <p>Confirmar</p>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/*Dialog para ver el resumen de la venta*/}
      <Dialog open={openSells} onOpenChange={setOpenSells}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center font-bold">
            Resumen de Venta
          </DialogHeader>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : sellsDetails ? (
            <div className="space-y-4">
                <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Fecha
                </h3>
                <p className="text-lg font-semibold">
                  {format(sellsDetails.date, "PPP", {
                    locale: es,
                  })}
                </p>
                <Separator />
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Cliente
                </h3>
                <p className="text-lg font-semibold">
                  {sellsDetails.client.name}
                </p>
                <Separator />
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Concepto
                </h3>
                <p className="text-lg font-semibold">
                  {sellsDetails.concept}
                </p>
                <Separator />
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Precio
                </h3>
                <p className="text-lg font-semibold">
                  {sellsDetails.total_price}
                </p>
                <Separator />
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Monto Pagado
                </h3>
                <p className="text-lg font-semibold">
                {sellsDetails.payed_amount}
                </p>
                <Separator />
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Referencia
                </h3>
                <p className="text-lg font-semibold">
                  {sellsDetails.reference_pic}
                </p>
                <Separator />
              </div>

            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              No se pudo cargar la información de la venta.
            </p>
          )}
          <DialogFooter className="sm:justify-center">
        {/*    <Button
              variant="outline"
              onClick={() => router.push(`/administracion/ventas/${id}`)}
            >
              Ver detalles completos
            </Button>  */}
            <Button onClick={() => setOpenSells(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SellDropdownActions;