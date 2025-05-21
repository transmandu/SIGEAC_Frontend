import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { EditIcon, EyeIcon, Loader2, MoreHorizontal, Trash2, } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { useGetAdministrationVendorById } from "@/hooks/administracion/useGetAdministrationVendorById";
import { useDeleteAdministrationVendor } from "@/actions/administracion/proveedor/actions";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "../ui/dialog";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { EditAdministrationVendorForm } from "../forms/EditAdministrationVendorForm";
("../forms/EditAdministrationVendorForm");

const AdministrationVendorDropdownActions = ({ id }: { id: string }) => {
  const [openVendor, setOpenVendor] = useState<boolean>(false);
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const router = useRouter();
  const { deleteAdministrationVendor } = useDeleteAdministrationVendor();
  const { data: vendorDetails, isLoading } = useGetAdministrationVendorById(id);
  const [openEdit, setOpenEdit] = useState<boolean>(false);

  const handleDelete = (id: number | string) => {
    deleteAdministrationVendor.mutate(id, {
      onSuccess: () => setOpenDelete(false), // Cierra el modal solo si la eliminación fue exitosa
    });
  };

  const handleViewDetails = () => {
    setOpenVendor(true);
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
          <DropdownMenuItem onClick={() => setOpenEdit(true)}>
            <EditIcon className="size-5 text-blue-500" />
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              router.push(`/administracion/gestion_general/proveedor/${id}`);
            }}
          ></DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/*Dialog para eliminar un proveedor*/}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault(); // Evita que el diálogo se cierre al hacer clic fuera
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-center">
              ¿Seguro que desea eliminar al proveedor?
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
              disabled={deleteAdministrationVendor.isPending}
              className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
              onClick={() => handleDelete(id)}
            >
              {deleteAdministrationVendor.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <p>Confirmar</p>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para ver el resumen del proveedor/beneficiario */}
      <Dialog open={openVendor} onOpenChange={setOpenVendor}>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault(); // Evita que el diálogo se cierre al hacer clic fuera
          }}
          aria-describedby={undefined} 
          className="sm:max-w-lg p-0 border-none"
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-8 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Cargando información...
              </p>
            </div>
          ) : vendorDetails ? (
            <div className="relative">
              {/* Header con gradiente según tipo */}
              <div
                className={`p-6 text-white rounded-t-lg ${
                  vendorDetails.type === "PROVEEDOR"
                    ? "bg-gradient-to-r from-blue-600 to-blue-500"
                    : "bg-gradient-to-r from-green-600 to-green-500"
                }`}
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-white">
                    <AvatarFallback
                      className={`font-semibold ${
                        vendorDetails.type === "PROVEEDOR"
                          ? "bg-white text-blue-600"
                          : "bg-white text-green-600"
                      }`}
                    >
                      {vendorDetails.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold">{vendorDetails.name}</h2>
                    <Badge
                      className={`mt-1 text-white ${
                        vendorDetails.type === "PROVEEDOR"
                          ? "bg-blue-700 hover:bg-blue-800"
                          : "bg-green-700 hover:bg-green-800"
                      }`}
                    >
                      {vendorDetails.type === "PROVEEDOR"
                        ? "PROVEEDOR"
                        : "BENEFICIARIO"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Contenido principal */}
              <div className="p-6 grid gap-6">
                {/* Grid de información básica */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg col-span-2">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1 ">
                      Email
                    </h3>
                    <p className="font-medium">
                      {vendorDetails.email || "No especificado"}
                    </p>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg col-span-2">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Teléfono
                    </h3>
                    <p className="font-medium">
                      {vendorDetails.phone || "No especificado"}
                    </p>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg col-span-2">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Dirección
                    </h3>
                    <p className="font-medium">
                      {vendorDetails.address || "No especificada"}
                    </p>
                  </div>
                </div>

                {/* Sección de información adicional */}
                <Card
                  className={`${
                    vendorDetails.type === "PROVEEDOR"
                      ? "bg-blue-50 border-blue-200"
                      : "bg-green-50 border-green-200"
                  }`}
                ></Card>
              </div>

              <DialogFooter className="px-6 pb-6">
                <Button
                  onClick={() => setOpenVendor(false)}
                  variant="outline"
                  className="w-full"
                >
                  Cerrar
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">
                No se pudo cargar la información
              </p>
              <Button
                onClick={() => setOpenVendor(false)}
                variant="outline"
                className="mt-4"
              >
                Cerrar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/*Dialog para editar un proveedor*/}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault(); // Evita que el diálogo se cierre al hacer clic fuera
          }}
          aria-describedby={undefined} 
        >
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          <EditAdministrationVendorForm
            id={id}
            onClose={() => setOpenEdit(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdministrationVendorDropdownActions;
