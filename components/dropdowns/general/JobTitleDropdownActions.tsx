"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useDeleteJobTitle } from "@/actions/general/cargo/actions";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import {
  SettingsRowActions,
  type RowAction,
} from "@/components/dropdowns/SettingsRowActions";
import { CreateJobTitleForm } from "@/components/forms/general/CreateJobTitleForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCompanyStore } from "@/stores/CompanyStore";
import { JobTitle } from "@/types";

const JobTitleDropdownActions = ({ jobTitle }: { jobTitle: JobTitle }) => {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const { selectedCompany } = useCompanyStore();
  const { deleteJobTitle } = useDeleteJobTitle();

  const actions: RowAction[] = [
    {
      key: "edit",
      label: "Editar cargo",
      icon: Pencil,
      tone: "blue",
      onSelect: () => setOpenEdit(true),
    },
    {
      key: "delete",
      label: "Eliminar cargo",
      icon: Trash2,
      tone: "red",
      onSelect: () => setOpenDelete(true),
    },
  ];

  return (
    <>
      <SettingsRowActions actions={actions} />

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-105">
          <DialogHeader>
            <DialogTitle>Editar cargo</DialogTitle>
            <DialogDescription>
              Modifique la información de{" "}
              <span className="font-medium text-foreground">{jobTitle.name}</span>
            </DialogDescription>
          </DialogHeader>
          <CreateJobTitleForm
            jobTitle={jobTitle}
            onSuccess={() => setOpenEdit(false)}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title="Eliminar cargo"
        entityName={jobTitle.name}
        isPending={deleteJobTitle.isPending}
        onConfirm={() =>
          deleteJobTitle.mutateAsync({
            id: jobTitle.id,
            company: selectedCompany!.slug,
          })
        }
      />
    </>
  );
};

export default JobTitleDropdownActions;
