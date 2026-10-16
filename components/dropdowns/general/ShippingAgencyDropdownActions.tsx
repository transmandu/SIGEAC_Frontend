"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { useDeleteShippingAgency } from "@/actions/ajustes/agencias_envio/actions";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import {
  SettingsRowActions,
  type RowAction,
} from "@/components/dropdowns/SettingsRowActions";
import { UpdateShippingAgencyForm } from "@/components/forms/general/UpdateShippingAgencyForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCompanyStore } from "@/stores/CompanyStore";
import { ShippingAgency } from "@/types";

const ShippingAgencyDropdownActions = ({
  agency,
}: {
  agency: ShippingAgency;
}) => {
  const { selectedCompany } = useCompanyStore();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const deleteAgency = useDeleteShippingAgency(selectedCompany?.slug);

  if (!selectedCompany) return null;

  const actions: RowAction[] = [
    {
      key: "edit",
      label: "Editar agencia",
      icon: Pencil,
      tone: "blue",
      onSelect: () => setEditOpen(true),
    },
    {
      key: "delete",
      label: "Eliminar agencia",
      icon: Trash2,
      tone: "red",
      onSelect: () => setDeleteOpen(true),
    },
  ];

  return (
    <>
      <SettingsRowActions actions={actions} tourId="agencias-envio-actions" />

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar agencia de envío</DialogTitle>
            <DialogDescription>
              Modifique lo necesario de{" "}
              <span className="font-medium text-foreground">{agency.name}</span>
              ; solo se guardará lo que cambie.
            </DialogDescription>
          </DialogHeader>
          <UpdateShippingAgencyForm
            agency={agency}
            onClose={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar agencia"
        entityName={agency.name}
        warning={
          <>
            Esta acción es <b>irreversible</b>. Si la agencia tiene órdenes de
            compra asociadas, no podrá ser eliminada.
          </>
        }
        isPending={deleteAgency.isPending}
        onConfirm={() => deleteAgency.mutateAsync(agency.id)}
      />
    </>
  );
};

export default ShippingAgencyDropdownActions;
