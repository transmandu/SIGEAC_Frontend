"use client";

import { useState } from "react";
import { Layers3, Pencil, Trash2 } from "lucide-react";
import { useDeleteSmsTrainingModulePattern } from "@/actions/general/cursos/training-modules";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import {
  SettingsRowActions,
  type RowAction,
} from "@/components/dropdowns/SettingsRowActions";
import { CreateSmsTrainingModulePatternForm } from "@/components/forms/general/CreateSmsTrainingModulePatternForm";
import { Dialog } from "@/components/ui/dialog";
import { useCompanyStore } from "@/stores/CompanyStore";
import { SmsTrainingModulePattern } from "@/types";

const SmsTrainingModulePatternDropdownActions = ({
  pattern,
}: {
  pattern: SmsTrainingModulePattern;
}) => {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const { selectedCompany } = useCompanyStore();
  const { deleteSmsTrainingModulePattern } =
    useDeleteSmsTrainingModulePattern();

  const actions: RowAction[] = [
    {
      key: "edit",
      label: "Editar patrón",
      icon: Pencil,
      tone: "blue",
      onSelect: () => setOpenEdit(true),
    },
    {
      key: "delete",
      label: "Eliminar patrón",
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
          icon={Layers3}
          title="Editar patrón"
          description={pattern.name}
          className="sm:max-w-150"
        >
          <CreateSmsTrainingModulePatternForm
            pattern={pattern}
            onSuccess={() => setOpenEdit(false)}
          />
        </FormDialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title="Eliminar patrón"
        entityName={pattern.name}
        isPending={deleteSmsTrainingModulePattern.isPending}
        onConfirm={() =>
          deleteSmsTrainingModulePattern.mutateAsync({
            id: pattern.id,
            company: selectedCompany!.slug,
          })
        }
      />
    </>
  );
};

export default SmsTrainingModulePatternDropdownActions;
