import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Banknote,
  EyeIcon,
  Loader2,
  MoreHorizontal,
  PlaneIcon,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { useDeleteAircraft } from "@/actions/administracion/aeronaves/actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { EditIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import { EditAircraftForm } from "../forms/EditAircraftForm";
import { AircraftExpensiveForm } from "../forms/AircraftExpensiveForm";
import Link from "next/link";
import { Aircraft } from "@/types";
import { useGetAircraftByAcronym } from "@/hooks/administracion/useGetAircraftByAcronym";

export const AircraftDropdownActions = ({
  aircraft,
}: {
  aircraft: Aircraft;
}) => {
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [openActions, setOpenActions] = useState<boolean>(false);
  const [openAircraft, setOpenAircraft] = useState<boolean>(false);
  const router = useRouter();
  const { deleteAircraft } = useDeleteAircraft();
  const [openEdit, setOpenEdit] = useState<boolean>(false);
  const [openForm, setOpenForm] = useState<boolean>(false);

  const handleViewStats = () => {
    router.push(
      `/transmandu/administracion/gestion_vuelos/aviones/${aircraft.acronym}`
    );
  };

  const handleDelete = (id: number | string) => {
    deleteAircraft.mutate(id, {
      onSuccess: () => setOpenDelete(false), // Cierra el modal solo si la eliminación fue exitosa
    });
  };

  const handleViewDetails = () => {
    setOpenAircraft(true);
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
          <DropdownMenuItem onClick={handleViewStats}>
            <TrendingUp className="size-5 text-green-500" />
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link
              href={`/transmandu/administracion/gestion_vuelos/aviones/${aircraft.acronym}/registrar_gasto`}
            >
              <Banknote className="size-5 text-red-500" />
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenEdit(true)}>
            <EditIcon className="size-5 text-blue-500" />
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              router.push(
                `/administracion/gestion_vuelos/aviones/${aircraft.acronym}`
              );
            }}
          ></DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/*Dialog para eliminar una aeronave*/}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault(); // Evita que el diálogo se cierre al hacer clic fuera
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-center">
              ¿Seguro que desea eliminar la aeronave?
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
              disabled={deleteAircraft.isPending}
              className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
              onClick={() => handleDelete(aircraft.id)}
            >
              {deleteAircraft.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <p>Confirmar</p>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/*Dialog para ver el resumen de una aeronave*/}
      <Dialog open={openAircraft} onOpenChange={setOpenAircraft}>
        <DialogContent
          className="sm:max-w-md"
          onInteractOutside={(e) => {
            e.preventDefault(); // Evita que el diálogo se cierre al hacer clic fuera
          }}
          aria-describedby={undefined}
        >
          <DialogHeader className="text-center font-bold">
            Resumen de Aeronave
          </DialogHeader>

          <div className="relative">
            {/* Header con gradiente según estado */}
            <div
              className={`p-6 text-white rounded-t-lg ${
                aircraft.status === "EN POSESION"
                  ? "bg-gradient-to-r from-green-600 to-emerald-500"
                  : aircraft.status === "RENTADO"
                    ? "bg-gradient-to-r from-amber-500 to-yellow-500"
                    : "bg-gradient-to-r from-red-600 to-red-500"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="bg-white p-3 rounded-lg shadow-sm border">
                  <PlaneIcon
                    className={`h-10 w-10 ${
                      aircraft.status === "EN POSESION"
                        ? "text-green-600"
                        : aircraft.status === "RENTADO"
                          ? "text-amber-500"
                          : "text-gray-600"
                    }`}
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{aircraft.model}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <Badge className="bg-white text-gray-800 hover:bg-gray-100">
                      {aircraft.acronym}
                    </Badge>
                    <Badge
                      className={`text-white ${
                        aircraft.status === "EN POSESION"
                          ? "bg-green-700 hover:bg-green-800"
                          : aircraft.status === "RENTADO"
                            ? "bg-amber-600 hover:bg-amber-700"
                            : "bg-gray-700 hover:bg-gray-800"
                      }`}
                    >
                      {aircraft.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenido principal */}
            <div className="p-6 grid gap-6">
              {/* Grid de información principal */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Serial
                  </h3>
                  <p className="font-medium">{aircraft.serial}</p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Fabricante
                  </h3>
                  <p className="font-medium">{aircraft.fabricant}</p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Fecha Fabricación
                  </h3>
                  <p className="font-medium">
                    {format(aircraft.fabricant_date, "PPP", {
                      locale: es,
                    })}
                  </p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Marca
                  </h3>
                  <p className="font-medium">{aircraft.brand}</p>
                </div>
              </div>

              {/* Información secundaria */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Ubicación
                </h3>
                <p className="font-medium">{aircraft.location.address}</p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Dueño
                </h3>
                <p className="font-medium">{aircraft.owner}</p>
              </div>

              {aircraft.comments && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Comentarios
                  </h3>
                  <p className="font-medium text-justify">
                    {aircraft.comments}
                  </p>
                </div>
              )}
            </div>
            <DialogFooter className="px-6 pb-6">
              <Button
                onClick={() => setOpenAircraft(false)}
                variant="outline"
                className="w-full"
              >
                Cerrar
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/*Redirige a la page para ver las estadisticas de ganancias mensuales de una aeronave*/}
      <Dialog open={openActions} onOpenChange={setOpenActions}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Acciones</DialogTitle>
            <DialogDescription>
              Selecciona una acción para {aircraft?.acronym || "esta aeronave"}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/*Formulario para cargar los gastos de una aeronave*/}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent
          className="lg:max-w-[550px]"
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>Gastos de la Aeronave</DialogTitle>
          </DialogHeader>
          <AircraftExpensiveForm
            id={aircraft.id.toString()}
            onClose={() => setOpenForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/*Dialog para editar una aeronave*/}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault(); // Evita que el diálogo se cierre al hacer clic fuera
          }}
        >
          <DialogHeader>
            <DialogTitle>Editar Aerovane</DialogTitle>
          </DialogHeader>
          <EditAircraftForm
            aircraft={aircraft}
            onClose={() => setOpenEdit(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AircraftDropdownActions;
