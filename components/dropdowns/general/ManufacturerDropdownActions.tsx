"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useDeleteManufacturer } from "@/actions/ajustes/fabricantes/actions";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import UpdateManufacturerForm from "@/components/forms/general/UpdateManufacturerForm";
import {
  SettingsRowActions,
  type RowAction,
} from "@/components/dropdowns/SettingsRowActions";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Manufacturer } from "@/types";

const ManufacturerDropdownActions = ({
  manufacturer,
}: {
  manufacturer: Manufacturer;
}) => {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const { selectedCompany } = useCompanyStore();
  const { user } = useAuth();
  const { deleteManufacturer } = useDeleteManufacturer();

  // El backend solo deja eliminar fabricantes a SUPERUSER.
  const canDelete = user?.roles?.some((role) => role.name === "SUPERUSER");

  const actions: RowAction[] = [
    {
      key: "edit",
      label: "Editar fabricante",
      icon: Pencil,
      tone: "blue",
      onSelect: () => setOpenEdit(true),
    },
    ...(canDelete
      ? [
          {
            key: "delete",
            label: "Eliminar fabricante",
            icon: Trash2,
            tone: "red" as const,
            onSelect: () => setOpenDelete(true),
          },
        ]
      : []),
  ];

  return (
    <>
      <SettingsRowActions actions={actions} tourId="fabricantes-actions" />

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar fabricante</DialogTitle>
            <DialogDescription>
              Modifique lo necesario de{" "}
              <span className="font-medium text-foreground">
                {manufacturer.name}
              </span>
              ; solo se guardará lo que cambie.
            </DialogDescription>
          </DialogHeader>
          <UpdateManufacturerForm
            manufacturer={manufacturer}
            onClose={() => setOpenEdit(false)}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title="Eliminar fabricante"
        entityName={manufacturer.name}
        isPending={deleteManufacturer.isPending}
        onConfirm={() =>
          deleteManufacturer.mutateAsync({
            company: selectedCompany?.slug,
            id: manufacturer.id,
          })
        }
      />
    </>
  );
};

export default ManufacturerDropdownActions;
