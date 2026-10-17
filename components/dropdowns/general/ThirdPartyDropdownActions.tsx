"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { useDeleteThirdParty } from "@/actions/sistema/terceros/actions";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import {
  SettingsRowActions,
  type RowAction,
} from "@/components/dropdowns/SettingsRowActions";
import UpdateThirdPartyForm from "@/components/forms/general/UpdateThirdPartyForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ThirdParty } from "@/types";

const ThirdPartyDropdownActions = ({
  thirdParty,
}: {
  thirdParty: ThirdParty;
}) => {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { deleteThirdParty } = useDeleteThirdParty();

  const actions: RowAction[] = [
    {
      key: "edit",
      label: "Editar tercero",
      icon: Pencil,
      tone: "blue",
      onSelect: () => setEditOpen(true),
    },
    {
      key: "delete",
      label: "Eliminar tercero",
      icon: Trash2,
      tone: "red",
      onSelect: () => setDeleteOpen(true),
    },
  ];

  return (
    <>
      <SettingsRowActions actions={actions} tourId="terceros-actions" />

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent
          className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Editar tercero</DialogTitle>
            <DialogDescription>
              Modifique lo necesario de{" "}
              <span className="font-medium text-foreground">
                {thirdParty.name}
              </span>
              ; solo se guardará lo que cambie.
            </DialogDescription>
          </DialogHeader>
          <UpdateThirdPartyForm
            thirdParty={thirdParty}
            onClose={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar tercero"
        entityName={thirdParty.name}
        warning={
          <>
            Esta acción es <b>irreversible</b>. Si el tercero está asociado a
            despachos, requisiciones o movimientos, no podrá ser eliminado.
          </>
        }
        isPending={deleteThirdParty.isPending}
        onConfirm={() => deleteThirdParty.mutateAsync(thirdParty.id)}
      />
    </>
  );
};

export default ThirdPartyDropdownActions;
