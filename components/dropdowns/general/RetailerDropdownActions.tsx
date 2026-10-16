"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useDeleteRetailer } from "@/actions/ajustes/comercios/actions";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import UpdateRetailerForm from "@/components/forms/general/UpdateRetailerForm";
import {
  SettingsRowActions,
  type RowAction,
} from "@/components/dropdowns/SettingsRowActions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Retailer } from "@/types";

export function RetailerDropdownActions({ retailer }: { retailer: Retailer }) {
  const { selectedCompany } = useCompanyStore();
  const { deleteRetailer } = useDeleteRetailer();
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const actions: RowAction[] = [
    {
      key: "edit",
      label: "Editar comercio",
      icon: Pencil,
      tone: "blue",
      onSelect: () => setOpenEdit(true),
    },
    {
      key: "delete",
      label: "Eliminar comercio",
      icon: Trash2,
      tone: "red",
      onSelect: () => setOpenDelete(true),
    },
  ];

  return (
    <>
      <SettingsRowActions actions={actions} tourId="comercios-actions" />

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar comercio</DialogTitle>
            <DialogDescription>
              Modifique lo necesario de{" "}
              <span className="font-medium text-foreground">
                {retailer.name}
              </span>
              ; solo se guardará lo que cambie.
            </DialogDescription>
          </DialogHeader>
          <UpdateRetailerForm
            retailer={retailer}
            onClose={() => setOpenEdit(false)}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title="Eliminar comercio"
        entityName={retailer.name}
        isPending={deleteRetailer.isPending}
        onConfirm={() =>
          deleteRetailer.mutateAsync({
            id: retailer.id,
            company: selectedCompany!.slug,
          })
        }
      />
    </>
  );
}

export default RetailerDropdownActions;
