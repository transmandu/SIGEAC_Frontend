"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useDeleteInformationSource } from "@/actions/ajustes/tipos_fuente/actions";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import {
  SettingsRowActions,
  type RowAction,
} from "@/components/dropdowns/SettingsRowActions";
import { EditInformationSourceForm } from "@/components/forms/aerolinea/sms/EditInformationSourceForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCompanyStore } from "@/stores/CompanyStore";
import { InformationSource } from "@/types";

const InformationSourceDropdownActions = ({
  informationSource,
}: {
  informationSource: InformationSource;
}) => {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const { deleteInformationSource } = useDeleteInformationSource();
  const { selectedCompany } = useCompanyStore();

  const actions: RowAction[] = [
    {
      key: "edit",
      label: "Editar fuente",
      icon: Pencil,
      tone: "blue",
      onSelect: () => setOpenEdit(true),
    },
    {
      key: "delete",
      label: "Eliminar fuente",
      icon: Trash2,
      tone: "red",
      onSelect: () => setOpenDelete(true),
    },
  ];

  return (
    <>
      <SettingsRowActions actions={actions} tourId="fuentes-actions" />

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-105">
          <DialogHeader>
            <DialogTitle>Editar fuente de información</DialogTitle>
            <DialogDescription>
              Modifique la información de{" "}
              <span className="font-medium text-foreground">
                {informationSource.name}
              </span>
            </DialogDescription>
          </DialogHeader>
          <EditInformationSourceForm
            initialData={informationSource}
            onClose={() => setOpenEdit(false)}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title="Eliminar fuente"
        entityName={informationSource.name}
        isPending={deleteInformationSource.isPending}
        onConfirm={() =>
          deleteInformationSource.mutateAsync({
            company: selectedCompany?.slug,
            id: informationSource.id,
          })
        }
      />
    </>
  );
};

export default InformationSourceDropdownActions;
