import { useDeleteChangeRequest } from "@/actions/sms/gestion_de_cambio/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCompanyStore } from "@/stores/CompanyStore";
import { ChangeRequest } from "@/types";
import { EyeIcon, Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ChangeManagementActions = ({
  changeManagement,
}: {
  changeManagement: ChangeRequest;
}) => {
  const { selectedCompany } = useCompanyStore();
  const router = useRouter();
  const { deleteChangeRequest } = useDeleteChangeRequest();
  const [openDelete, setOpenDelete] = useState<boolean>(false);

  const handleDelete = async () => {
    if (!selectedCompany) return;
    await deleteChangeRequest.mutateAsync({
      company: selectedCompany.slug,
      id: changeManagement.id,
    });
    setOpenDelete(false);
  };

  return (
    <Dialog open={openDelete} onOpenChange={setOpenDelete}>
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
          <DropdownMenuItem
            onClick={() => {
              router.push(
                `/${selectedCompany?.slug}/sms/aseguramiento_calidad/gestion_de_cambio/${changeManagement.id}`
              );
            }}
          >
            <EyeIcon className="size-5" />
            <p className="pl-2">Ver</p>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              router.push(
                `/${selectedCompany?.slug}/sms/aseguramiento_calidad/gestion_de_cambio/${changeManagement.id}/editar`
              );
            }}
          >
            <Pencil className="size-5" />
            <p className="pl-2">Editar</p>
          </DropdownMenuItem>

          <DialogTrigger asChild>
            <DropdownMenuItem>
              <Trash2 className="size-5 text-red-500" />
              <p className="pl-2">Eliminar</p>
            </DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent>
        <DialogHeader className="pb-2 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-500 shrink-0">
              <Trash2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold leading-tight">
                Eliminar solicitud de cambio
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Solicitud #{changeManagement.id} —{" "}
                {changeManagement.department?.acronym}
              </p>
            </div>
          </div>
        </DialogHeader>

        <DialogDescription className="text-sm text-muted-foreground">
          Esta acción es irreversible y eliminará por completo la solicitud de
          cambio seleccionada, incluyendo todos sus ítems, recursos financieros,
          evaluaciones de riesgo y actividades asociadas.
        </DialogDescription>

        <DialogFooter className="flex flex-col-reverse gap-2 md:gap-0">
          <Button
            className="bg-rose-400 hover:bg-white hover:text-black hover:border hover:border-black"
            onClick={() => setOpenDelete(false)}
            type="button"
          >
            Cancelar
          </Button>

          <Button
            disabled={deleteChangeRequest.isPending}
            className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
            onClick={handleDelete}
            type="button"
          >
            {deleteChangeRequest.isPending ? (
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

export default ChangeManagementActions;
