"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useDeletePilot } from "@/actions/ajustes/piloto/actions";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import {
  SettingsRowActions,
  type RowAction,
} from "@/components/dropdowns/SettingsRowActions";
import { UpdatePilotForm } from "@/components/forms/general/UpdatePilotForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Pilot } from "@/types";

const PilotDropdownActions = ({ pilot }: { pilot: Pilot }) => {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const { deletePilot } = useDeletePilot();
  const { selectedCompany } = useCompanyStore();
  const router = useRouter();

  const fullName =
    `${pilot.employee?.first_name ?? ""} ${pilot.employee?.last_name ?? ""}`.trim();

  const actions: RowAction[] = [
    {
      key: "view",
      label: "Ver piloto",
      icon: Eye,
      onSelect: () =>
        router.push(
          `/${selectedCompany?.slug}/ajustes/pilotos/${pilot.employee_dni}`,
        ),
    },
    {
      key: "edit",
      label: "Editar piloto",
      icon: Pencil,
      tone: "blue",
      onSelect: () => setOpenEdit(true),
    },
    {
      key: "delete",
      label: "Eliminar piloto",
      icon: Trash2,
      tone: "red",
      onSelect: () => setOpenDelete(true),
    },
  ];

  return (
    <>
      <SettingsRowActions actions={actions} tourId="pilotos-actions" />

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar piloto</DialogTitle>
            <DialogDescription>
              Modifique lo necesario de{" "}
              <span className="font-medium text-foreground">{fullName}</span>;
              solo se guardará lo que cambie.
            </DialogDescription>
          </DialogHeader>
          <UpdatePilotForm pilot={pilot} onClose={() => setOpenEdit(false)} />
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title="Eliminar piloto"
        entityName={fullName || pilot.employee_dni}
        warning={
          <>
            Se eliminará su registro como piloto. El empleado <b>no</b> se
            elimina. Si el piloto tiene vuelos o envíos registrados, no podrá
            ser eliminado.
          </>
        }
        isPending={deletePilot.isPending}
        onConfirm={() =>
          deletePilot.mutateAsync({
            company: selectedCompany?.slug,
            id: pilot.id,
          })
        }
      />
    </>
  );
};

export default PilotDropdownActions;
