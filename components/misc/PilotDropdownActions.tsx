"use client";

import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { useState } from "react";
import { Pencil, Trash2, PlaneTakeoff } from "lucide-react";
import { useDeletePilot } from "@/actions/ajustes/piloto/actions";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import {
  SettingsRowActions,
  type RowAction,
} from "@/components/dropdowns/SettingsRowActions";
import { UpdatePilotForm } from "@/components/forms/general/UpdatePilotForm";
import { Dialog } from "@/components/ui/dialog";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Pilot } from "@/types";

const PilotDropdownActions = ({ pilot }: { pilot: Pilot }) => {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const { deletePilot } = useDeletePilot();
  const { selectedCompany } = useCompanyStore();

  const fullName =
    `${pilot.employee?.first_name ?? ""} ${pilot.employee?.last_name ?? ""}`.trim();

  const actions: RowAction[] = [
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
        <FormDialogContent
          icon={PlaneTakeoff}
          title="Editar piloto"
          description={
            <>
              Modifique lo necesario de{" "}
              <span className="font-medium text-foreground">{fullName}</span>;
              solo se guardará lo que cambie.
            </>
          }
          className="sm:max-w-2xl"
        >
          <UpdatePilotForm pilot={pilot} onClose={() => setOpenEdit(false)} />
        </FormDialogContent>
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
