"use client";

import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { useState } from "react";
import { Pencil, Trash2, BriefcaseBusiness } from "lucide-react";
import { useDeleteJobTitle } from "@/actions/general/cargo/actions";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import {
  SettingsRowActions,
  type RowAction,
} from "@/components/dropdowns/SettingsRowActions";
import { CreateJobTitleForm } from "@/components/forms/general/CreateJobTitleForm";
import { Dialog } from "@/components/ui/dialog";
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
        <FormDialogContent
          icon={BriefcaseBusiness}
          title="Editar cargo"
          description={
            <>
              Modifique la información de{" "}
              <span className="font-medium text-foreground">
                {" "}
                {jobTitle.name}{" "}
              </span>
            </>
          }
          className="sm:max-w-105"
        >
          <CreateJobTitleForm
            jobTitle={jobTitle}
            onSuccess={() => setOpenEdit(false)}
          />
        </FormDialogContent>
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
