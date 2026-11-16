"use client";

import { useState } from "react";
import { BookOpen, Pencil, Power, PowerOff, Trash2 } from "lucide-react";
import {
  useDeleteSmsTrainingModule,
  useToggleSmsTrainingModuleActive,
} from "@/actions/general/cursos/training-modules";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import {
  SettingsRowActions,
  type RowAction,
} from "@/components/dropdowns/SettingsRowActions";
import { CreateSmsTrainingModuleForm } from "@/components/forms/general/CreateSmsTrainingModuleForm";
import { Dialog } from "@/components/ui/dialog";
import { useCompanyStore } from "@/stores/CompanyStore";
import { SmsTrainingModule } from "@/types";

const SmsTrainingModuleDropdownActions = ({
  module,
}: {
  module: SmsTrainingModule;
}) => {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const { selectedCompany } = useCompanyStore();
  const { deleteSmsTrainingModule } = useDeleteSmsTrainingModule();
  const { toggleSmsTrainingModuleActive } = useToggleSmsTrainingModuleActive();

  const actions: RowAction[] = [
    {
      key: "edit",
      label: "Editar módulo",
      icon: Pencil,
      tone: "blue",
      onSelect: () => setOpenEdit(true),
    },
    {
      key: "toggle-active",
      label: module.is_active ? "Desactivar módulo" : "Activar módulo",
      icon: module.is_active ? PowerOff : Power,
      tone: "default",
      onSelect: () =>
        toggleSmsTrainingModuleActive.mutate({
          id: module.id,
          company: selectedCompany!.slug,
        }),
    },
    {
      key: "delete",
      label: "Eliminar módulo",
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
          icon={BookOpen}
          title="Editar módulo"
          description={module.name}
          className="sm:max-w-120"
        >
          <CreateSmsTrainingModuleForm
            module={module}
            onSuccess={() => setOpenEdit(false)}
          />
        </FormDialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title="Eliminar módulo"
        entityName={module.name}
        isPending={deleteSmsTrainingModule.isPending}
        onConfirm={() =>
          deleteSmsTrainingModule.mutateAsync({
            id: module.id,
            company: selectedCompany!.slug,
          })
        }
      />
    </>
  );
};

export default SmsTrainingModuleDropdownActions;
