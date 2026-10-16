"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { useDeleteCondition } from "@/actions/aerolinea/almacen/condiciones_articulos/actions";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import {
  SettingsRowActions,
  type RowAction,
} from "@/components/dropdowns/SettingsRowActions";
import UpdateConditionForm from "@/components/forms/ajustes/UpdateConditionForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Condition } from "@/types";

const ConditionDropdownActions = ({ condition }: { condition: Condition }) => {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { deleteCondition } = useDeleteCondition();

  const actions: RowAction[] = [
    {
      key: "edit",
      label: "Editar condición",
      icon: Pencil,
      tone: "blue",
      onSelect: () => setEditOpen(true),
    },
    {
      key: "delete",
      label: "Eliminar condición",
      icon: Trash2,
      tone: "red",
      onSelect: () => setDeleteOpen(true),
    },
  ];

  return (
    <>
      <SettingsRowActions actions={actions} tourId="condiciones-actions" />

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar condición</DialogTitle>
            <DialogDescription>
              Modifique lo necesario de{" "}
              <span className="font-medium text-foreground">
                {condition.name}
              </span>
              ; solo se guardará lo que cambie.
            </DialogDescription>
          </DialogHeader>
          <UpdateConditionForm
            condition={condition}
            onClose={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar condición"
        entityName={condition.name}
        warning={
          <>
            Esta acción es <b>irreversible</b>. Si la condición está en uso por
            artículos, o excluye del costo y tiene salidas registradas, no
            podrá ser eliminada.
          </>
        }
        isPending={deleteCondition.isPending}
        onConfirm={() => deleteCondition.mutateAsync(condition.id)}
      />
    </>
  );
};

export default ConditionDropdownActions;
