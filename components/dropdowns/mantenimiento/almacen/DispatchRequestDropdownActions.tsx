import { useDeleteDispatchRequest } from "@/actions/mantenimiento/almacen/solicitudes/salida/action";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../ui/dialog";

const DispatchRequestDropdownActions = ({
  id,
}: {
  id: string | number;
}) => {
  const [openDelete, setOpenDelete] = useState(false);

  const { selectedCompany } = useCompanyStore();
  const { deleteDispatchRequest } = useDeleteDispatchRequest();

  const handleDelete = async () => {
    if (!selectedCompany?.slug) return;

    await deleteDispatchRequest.mutateAsync({
      id,
      company: selectedCompany.slug,
    });

    setOpenDelete(false);
  };

  return (
    <Dialog open={openDelete} onOpenChange={setOpenDelete}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="flex gap-2 justify-center">
          <DialogTrigger asChild>
            <DropdownMenuItem className="cursor-pointer">
              <Trash2 className="size-5 text-red-500" />
            </DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">
            ¿Seguro que desea eliminar esta solicitud de salida?
          </DialogTitle>
          <DialogDescription className="text-center p-2 mb-0 pb-0">
            Esta acción es irreversible y repondrá el stock de los artículos asociados.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2 md:gap-0">
          <Button
            className="bg-rose-400 hover:bg-white hover:text-black hover:border hover:border-black"
            onClick={() => setOpenDelete(false)}
            type="button"
          >
            Cancelar
          </Button>
          <Button
            disabled={deleteDispatchRequest.isPending}
            className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
            onClick={handleDelete}
            type="button"
          >
            {deleteDispatchRequest.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <p>Confirmar</p>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DispatchRequestDropdownActions;
