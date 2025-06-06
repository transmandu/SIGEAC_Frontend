import { useDeletePilot } from "@/actions/ajustes/globales/piloto/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pilot } from "@/types";
import {
  ClipboardPen,
  EyeIcon,
  Loader2,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useRouter } from "next/navigation";
import { CreatePilotForm } from "../forms/CreatePilotForm";

const PilotDropdownActions = ({ pilot }: { pilot: Pilot }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [openEdit, setOpenEdit] = useState<boolean>(false);
  const { deletePilot } = useDeletePilot();

  const router = useRouter();

  const handleDelete = async (id: number | string) => {
    await deletePilot.mutateAsync(id);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          <DialogTrigger asChild>
            <DropdownMenuItem>
              <Trash2 className="size-5 text-red-500" />
              <p className="pl-2">Eliminar</p>
            </DropdownMenuItem>
          </DialogTrigger>

          <DropdownMenuItem
            onClick={() => {
              router.push(`/ajustes/globales/pilotos/${pilot.dni}`);
            }}
          >
            <EyeIcon className="size-5" />
            <p className="pl-2">Ver</p>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenEdit(true)}>
            <ClipboardPen className="size-5" />
            <p className="pl-2">Editar</p>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">
            ¿Seguro que desea eliminar el piloto?
          </DialogTitle>
          <DialogDescription className="text-center p-2 mb-0 pb-0">
            Esta acción es irreversible y estaría eliminando por completo el
            piloto seleccionado.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-col-reverse gap-2 md:gap-0">
          <Button
            className="bg-rose-400 hover:bg-white hover:text-black hover:border hover:border-black"
            onClick={() => setOpen(false)}
            type="submit"
          >
            Cancelar
          </Button>

          <Button
            disabled={deletePilot.isPending}
            className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
            onClick={() => handleDelete(pilot.id)}
          >
            {deletePilot.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <p>Confirmar</p>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">Edicion de Piloto</DialogTitle>
            <CreatePilotForm
              initialData={pilot}
              isEditing={true}
              onClose={() => setOpenEdit(false)}
            />
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default PilotDropdownActions;
