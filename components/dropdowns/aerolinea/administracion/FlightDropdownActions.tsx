import { useDeleteFlight } from "@/actions/aerolinea/vuelos/actions";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { AdministrationFlight } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowRightIcon, EyeIcon, FileTextIcon, Loader2, MapPinIcon, MoreHorizontal, PlaneIcon, PlaneLanding, Trash2, UserIcon, } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "../../../ui/badge";
import { Button } from "../../../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "../../../ui/dialog";
import { Separator } from "../../../ui/separator";

const FlightDropdownActions = ({ flight }: { flight: AdministrationFlight }) => {
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [openFlight, setOpenFlight] = useState<boolean>(false);
  const router = useRouter();
  const { deleteFlight } = useDeleteFlight();

  const handleDelete = (id: number | string) => {
    deleteFlight.mutate(id, {
      onSuccess: () => setOpenDelete(false),
    });
  };

  const handleViewDetails = () => {
    setOpenFlight(true);
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
              router.push(`/administracion/vuelos/${flight}`);
            }}
          ></DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/*Dialog para eliminar el registro de un vuelo*/}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault(); // Evita que el diálogo se cierre al hacer clic fuera
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-center">
              ¿Seguro que desea eliminar el registro del vuelo?
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
              disabled={deleteFlight.isPending}
              className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
              onClick={() => handleDelete(flight.id)}
            >
              {deleteFlight.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <p>Confirmar</p>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/*Dialog para ver el resumen de un vuelo*/}
      <Dialog open={openFlight} onOpenChange={setOpenFlight}>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault(); // Evita que el diálogo se cierre al hacer clic fuera
          }}
          aria-describedby={undefined}
          className="sm:max-w-xl rounded-lg"
        >
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <PlaneIcon className="h-5 w-5 text-primary" />
                  Vuelo # {flight.guide_code}
                </DialogTitle>
                <DialogDescription className="text-sm">
                  {format(flight.date, "PPP", { locale: es })}
                </DialogDescription>
              </div>
              <Badge variant="outline" className="text-sm">
                {flight.type}
              </Badge>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {/* Sección de Información Principal */}
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  Cliente
                </h3>
                <p className="font-semibold">{flight.client.name}</p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4" />
                  Ruta
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Origen</p>
                    <p className="font-semibold">{flight.flight.route.from}</p>
                  </div>
                  <ArrowRightIcon className="h-4 w-4 mx-4" />
                  <div>
                    <p className="text-sm text-muted-foreground">Destino</p>
                    <p className="font-semibold">{flight.flight.route.to}</p>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <PlaneLanding className="h-4 w-4" />
                  Aeronave
                </h3>
                <p className="font-semibold">{flight.flight.aircraft.acronym}</p>
              </div>
            </div>

            {/* Sección Financiera */}
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-medium mb-3">Detalles Financieros</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Tarifa:</span>
                    <span className="font-medium">{flight.fee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Costo Total:</span>
                    <span className="font-bold">{flight.total_amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Pagado:</span>
                    <span
                      className={cn(
                        "font-medium",
                        (Number(flight.payed_amount)) === (Number(flight.total_amount))
                          ? "text-green-600"
                          : "text-yellow-600"
                      )}
                    >
                      {flight.payed_amount}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm">Estado:</span>
                    <Badge
                      variant={
                        flight.debt_status === "PAGADO"
                          ? "default"
                          : "destructive"
                      }
                    >
                      {flight.debt_status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <FileTextIcon className="h-4 w-4" />
                  Observaciones
                </h3>
                <p className="text-sm">
                  {flight.details || "Sin observaciones"}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setOpenFlight(false)}
              className="w-full"
              variant="outline"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FlightDropdownActions;
