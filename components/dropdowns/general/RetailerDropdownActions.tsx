"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useDeleteRetailer } from "@/actions/ajustes/comercios/actions";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import CreateRetailerForm from "@/components/forms/general/CreateRetailerForm";
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
        <DialogContent className="sm:max-w-[490px]">
          <DialogHeader>
            <DialogTitle>Editar comercio</DialogTitle>
            <DialogDescription>
              Modifique la información de{" "}
              <span className="font-medium text-foreground">
                {retailer.name}
              </span>
            </DialogDescription>
          </DialogHeader>
          <CreateRetailerForm
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
