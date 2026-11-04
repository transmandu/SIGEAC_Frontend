"use client";

import { useState } from "react";
import { Pencil, Trash2, UsersRound } from "lucide-react";
import { useDeleteSmsTrainingGroup } from "@/actions/general/cursos/training-groups";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import {
  SettingsRowActions,
  type RowAction,
} from "@/components/dropdowns/SettingsRowActions";
import { CreateSmsTrainingGroupForm } from "@/components/forms/general/CreateSmsTrainingGroupForm";
import { Dialog } from "@/components/ui/dialog";
import { useCompanyStore } from "@/stores/CompanyStore";
import { SmsTrainingGroup } from "@/types";

const SmsTrainingGroupDropdownActions = ({
  group,
}: {
  group: SmsTrainingGroup;
}) => {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const { selectedCompany } = useCompanyStore();
  const { deleteSmsTrainingGroup } = useDeleteSmsTrainingGroup();

  const actions: RowAction[] = [
    {
      key: "edit",
      label: "Editar grupo",
      icon: Pencil,
      tone: "blue",
      onSelect: () => setOpenEdit(true),
    },
    {
      key: "delete",
      label: "Eliminar grupo",
      icon: Trash2,
      tone: "red",
      onSelect: () => setOpenDelete(true),
    },
  ];

  return (
    <>
      <SettingsRowActions actions={actions} />

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <FormDialogContent
          icon={UsersRound}
          title="Editar grupo de capacitación"
          description={
            <>
              Modifique los cargos incluidos en{" "}
              <span className="font-medium text-foreground">{group.name}</span>
            </>
          }
          className="sm:max-w-120"
        >
          <CreateSmsTrainingGroupForm
            group={group}
            onSuccess={() => setOpenEdit(false)}
          />
        </FormDialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title="Eliminar grupo de capacitación"
        entityName={group.name}
        isPending={deleteSmsTrainingGroup.isPending}
        onConfirm={() =>
          deleteSmsTrainingGroup.mutateAsync({
            id: group.id,
            company: selectedCompany!.slug,
          })
        }
      />
    </>
  );
};

export default SmsTrainingGroupDropdownActions;
