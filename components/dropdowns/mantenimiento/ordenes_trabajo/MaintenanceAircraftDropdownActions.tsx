import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useDeleteMaintenanceAircraft } from "@/actions/mantenimiento/planificacion/aeronaves/actions";
import { ReasonConfirmDialog } from "@/components/dialogs/mantenimiento/planificacion/ReasonConfirmDialog";
import { Button } from "@/components/ui/button";
import { useCompanyStore } from "@/stores/CompanyStore";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";

const MaintenanceAircraftDropdownActions = ({
  acronym,
}: {
  acronym: string;
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const { deleteAircraft } = useDeleteMaintenanceAircraft();
  const { selectedCompany } = useCompanyStore();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="center"
          className="flex gap-2 justify-center"
        >
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => setOpen(true)}
          >
            <Trash2 className="size-5 text-red-500" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ReasonConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Eliminar la aeronave ${acronym}`}
        description="Se elimina la aeronave con sus partes. Si tiene vuelos o controles de mantenimiento registrados no puede eliminarse: cambie su estado."
        confirmLabel="Eliminar"
        destructive
        onConfirm={(reason) =>
          deleteAircraft.mutateAsync({
            acronym,
            company: selectedCompany!.slug,
            reason,
          })
        }
      />
    </>
  );
};

export default MaintenanceAircraftDropdownActions;
