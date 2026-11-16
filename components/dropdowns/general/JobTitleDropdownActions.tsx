"use client";

import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { useState } from "react";
import { Pencil, Trash2, BriefcaseBusiness } from "lucide-react";
import { toast } from "sonner";
import { useDeleteJobTitle } from "@/actions/general/cargo/actions";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import {
  SettingsRowActions,
  type RowAction,
} from "@/components/dropdowns/SettingsRowActions";
import { CreateJobTitleForm } from "@/components/forms/general/CreateJobTitleForm";
import { Dialog } from "@/components/ui/dialog";
import { useCanManageCatalog } from "@/hooks/helpers/useCanManageCatalog";
import { useCompanyStore } from "@/stores/CompanyStore";
import { JobTitle } from "@/types";

const JobTitleDropdownActions = ({ jobTitle }: { jobTitle: JobTitle }) => {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const { selectedCompany } = useCompanyStore();
  const { deleteJobTitle } = useDeleteJobTitle();
  const canManage = useCanManageCatalog("jobTitles");
  const employeeCount = jobTitle.employees_count ?? 0;

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
      onSelect: () => {
        // Con empleados el servidor lo rechaza; se avisa antes de abrir el diálogo.
        if (employeeCount > 0) {
          toast.warning("No se puede eliminar este cargo", {
            description: `Tiene ${employeeCount} ${
              employeeCount === 1 ? "empleado asignado" : "empleados asignados"
            }. Reasígnelos a otro cargo primero.`,
          });
          return;
        }
        setOpenDelete(true);
      },
    },
  ];

  if (!canManage) return null;

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
                {jobTitle.name}
              </span>
            </>
          }
          className="sm:max-w-105"
        >
          <CreateJobTitleForm
            jobTitle={jobTitle}
            onSuccess={() => setOpenEdit(false)}
            onCancel={() => setOpenEdit(false)}
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
