"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { useDeleteVendor } from "@/actions/ajustes/proveedores/actions";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import {
  SettingsRowActions,
  type RowAction,
} from "@/components/dropdowns/SettingsRowActions";
import UpdateVendorForm from "@/components/forms/general/UpdateVendorForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Vendor } from "@/types";

const VendorDropdownActions = ({ vendor }: { vendor: Vendor }) => {
  const { selectedCompany } = useCompanyStore();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const deleteVendor = useDeleteVendor(selectedCompany?.slug);

  if (!selectedCompany) return null;

  const actions: RowAction[] = [
    {
      key: "edit",
      label: "Editar proveedor",
      icon: Pencil,
      tone: "blue",
      onSelect: () => setEditOpen(true),
    },
    {
      key: "delete",
      label: "Eliminar proveedor",
      icon: Trash2,
      tone: "red",
      onSelect: () => setDeleteOpen(true),
    },
  ];

  return (
    <>
      <SettingsRowActions actions={actions} tourId="proveedores-actions" />

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Editar proveedor</DialogTitle>
            <DialogDescription>
              Modifique lo necesario de{" "}
              <span className="font-medium text-foreground">{vendor.name}</span>
              ; solo se guardará lo que cambie.
            </DialogDescription>
          </DialogHeader>
          <UpdateVendorForm vendor={vendor} onClose={() => setEditOpen(false)} />
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar proveedor"
        entityName={vendor.name}
        warning={
          <>
            Esta acción es <b>irreversible</b>. Si el proveedor tiene órdenes de
            compra o cotizaciones asociadas, no podrá ser eliminado.
          </>
        }
        isPending={deleteVendor.isPending}
        onConfirm={() => deleteVendor.mutateAsync(vendor.id)}
      />
    </>
  );
};

export default VendorDropdownActions;
