import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  EditIcon,
  EyeIcon,
  Loader2,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { useGetAdministrationCompanyById } from "@/hooks/administracion/useGetAdministrationCompanyById";
import { useDeleteAdministrationCompany } from "@/actions/administracion/empresa/actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { EditAdministrationCompanyForm } from "../forms/EditAdministrationCompanyForm";

const AdministrationCompanyDropdownActions = ({ id }: { id: string }) => {
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [openAdminCompany, setOpenAdminCompany] = useState<boolean>(false);
  const router = useRouter();
  const { DeleteAdministrationCompany } = useDeleteAdministrationCompany();
  const { data: adminCompany, isLoading } = useGetAdministrationCompanyById(id);
  const [openEdit, setOpenEdit] = useState<boolean>(false);

  const handleDelete = (id: number | string) => {
    DeleteAdministrationCompany.mutate(id, {
      onSuccess: () => setOpenDelete(false), // Cierra el modal solo si la eliminación fue exitosa
    });
  };

  const handleViewDetails = () => {
    setOpenAdminCompany(true);
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
              router.push(`/administracion/gestion_general/empresa/${id}`);
            }}
          ></DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/*Dialog para eliminar el registro de la empresa*/}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault(); // Evita que el diálogo se cierre al hacer clic fuera
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-center">
              ¿Seguro que desea eliminar el registro de la empresa?
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
              disabled={DeleteAdministrationCompany.isPending}
              className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
              onClick={() => handleDelete(id)}
            >
              {DeleteAdministrationCompany.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <p>Confirmar</p>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/*Dialog para ver el resumen de la empresa*/}
      <Dialog open={openAdminCompany} onOpenChange={setOpenAdminCompany}>
        <DialogContent
          className="sm:max-w-md"
          onInteractOutside={(e) => {
            e.preventDefault(); // Evita que el diálogo se cierre al hacer clic fuera
          }}
        >
          <DialogHeader className="text-center font-bold">
            Resumen de Empresa
          </DialogHeader>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : adminCompany ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Cliente
                </h3>
                <p className="text-lg font-semibold">{adminCompany.name}</p>
                <Separator />
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  RIF
                </h3>
                <p className="text-lg font-semibold">{adminCompany.rif}</p>
                <Separator />
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Dirección Fiscal
                </h3>
                <p className="text-lg font-semibold">
                  {adminCompany.fiscal_address}
                </p>
                <Separator />
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Número de Telefono
                </h3>
                <p className="text-lg font-semibold">
                  {adminCompany.phone_number}
                </p>
                <Separator />
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              No se pudo cargar la información de la empresa.
            </p>
          )}

          <DialogFooter className="sm:justify-center">
            <Button onClick={() => setOpenAdminCompany(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/*Dialog para editar los datos de una empresa*/}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault(); // Evita que el diálogo se cierre al hacer clic fuera
          }}
        >
          <DialogHeader>
            <DialogTitle>Editar Empresa</DialogTitle>
          </DialogHeader>
          <EditAdministrationCompanyForm
            id={id}
            onClose={() => setOpenEdit(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdministrationCompanyDropdownActions;
