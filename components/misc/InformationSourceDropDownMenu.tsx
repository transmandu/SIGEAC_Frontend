import { useDeleteInformationSource } from "@/actions/ajustes/globales/tipos_fuente/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InformationSource } from "@/types";
import { ClipboardPen, Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EditInformationSourceForm } from "../forms/EditInformationSourceForm";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

const InformationSourceDropdownActions = ({
  informationSource,
}: {
  informationSource: InformationSource;
}) => {
  const [openDelete, setOpenDelete] = useState<boolean>(false);

  const [openEdit, setOpenEdit] = useState<boolean>(false);

  const { deleteInformationSource } = useDeleteInformationSource();

  const router = useRouter();

  const handleDelete = async (id: number | string) => {
    await deleteInformationSource.mutateAsync(id);
    setOpenDelete(false);
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
          className="flex-col gap-2 justify-center"
        >
          <DropdownMenuItem onClick={() => setOpenDelete(true)}>
            <Trash2 className="size-5 text-red-500" />
            <p className="pl-2">Eliminar</p>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenEdit(true)}>
            <ClipboardPen className="size-5" />
            <p className="pl-2">Editar</p>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* DIALOGO DE ELIMINAR */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">
              ¿Seguro que desea eliminar la fuente?
            </DialogTitle>
            <DialogDescription className="text-center p-2 mb-0 pb-0">
              Esta acción es irreversible y estaría eliminando por completo el
              piloto seleccionado.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col-reverse gap-2 md:gap-0">
            <Button
              className="bg-rose-400 hover:bg-white hover:text-black hover:border hover:border-black"
              onClick={() => setOpenDelete(false)}
              type="submit"
            >
              Cancelar
            </Button>

            <Button
              disabled={deleteInformationSource.isPending}
              className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
              onClick={() => handleDelete(informationSource.id)}
            >
              {deleteInformationSource.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <p>Confirmar</p>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOGO DE EDITAR */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">Edicion de Fuente</DialogTitle>
            <DialogDescription className="text-center p-2 mb-0 pb-0">
              Edicion de Fuente de Informacion
            </DialogDescription>

            <EditInformationSourceForm
              initialData={informationSource}
              onClose={() => setOpenEdit(false)}
            />
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InformationSourceDropdownActions;
