import { useDeleteAdministrationVendor } from "@/actions/aerolinea/proveedor/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Vendor } from "@/types";
import {
  EditIcon,
  EyeIcon,
  Loader2,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EditAdministrationVendorForm } from "../../../forms/aerolinea/administracion/EditAdministrationVendorForm";
import { Avatar, AvatarFallback } from "../../../ui/avatar";
import { Badge } from "../../../ui/badge";
import { Button } from "../../../ui/button";
import { Card } from "../../../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../ui/dialog";
("../forms/EditAdministrationVendorForm");

const AdministrationVendorDropdownActions = ({
  vendor,
}: {
  vendor: Vendor;
}) => {
  const [openVendor, setOpenVendor] = useState<boolean>(false);
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const router = useRouter();
  const { deleteAdministrationVendor } = useDeleteAdministrationVendor();
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
              router.push(
                `/administracion/gestion_general/proveedor/${vendor.id}`
              );
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
              onClick={() => handleDelete(vendor.id)}
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
          <div className="relative">
            {/* Header con gradiente según tipo */}
            <div
              className={`p-6 text-white rounded-t-lg ${
                vendor.type === "PROVEEDOR"
                  ? "bg-gradient-to-r from-blue-600 to-blue-500"
                  : "bg-gradient-to-r from-green-600 to-green-500"
              }`}
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-white">
                  <AvatarFallback
                    className={`font-semibold ${
                      vendor.type === "PROVEEDOR"
                        ? "bg-white text-blue-600"
                        : "bg-white text-green-600"
                    }`}
                  >
                    {vendor.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">{vendor.name}</h2>
                  <Badge
                    className={`mt-1 text-white ${
                      vendor.type === "PROVEEDOR"
                        ? "bg-blue-700 hover:bg-blue-800"
                        : "bg-green-700 hover:bg-green-800"
                    }`}
                  >
                    {vendor.type === "PROVEEDOR" ? "PROVEEDOR" : "BENEFICIARIO"}
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
                    {vendor.email || "No especificado"}
                  </p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg col-span-2">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Teléfono
                  </h3>
                  <p className="font-medium">
                    {vendor.phone || "No especificado"}
                  </p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg col-span-2">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Dirección
                  </h3>
                  <p className="font-medium">
                    {vendor.address || "No especificada"}
                  </p>
                </div>
              </div>

              {/* Sección de información adicional */}
              <Card
                className={`${
                  vendor.type === "PROVEEDOR"
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
            vendor={vendor}
            onClose={() => setOpenEdit(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdministrationVendorDropdownActions;
