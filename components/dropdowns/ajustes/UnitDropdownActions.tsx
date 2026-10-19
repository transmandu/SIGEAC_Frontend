"use client";

import { useDeleteUnit } from "@/actions/ajustes/unidades/actions";
import { Pencil, Trash2 } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import {
  SettingsRowActions,
  type RowAction,
} from "@/components/dropdowns/SettingsRowActions";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import UpdateUnitForm from "@/components/forms/ajustes/UpdateUnitForm";
import { Unit } from "@/types";

const UnitDropdownActions = ({ unit }: { unit: Unit }) => {
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);

  const { deleteUnit } = useDeleteUnit();

  const actions: RowAction[] = [
    {
      key: "edit",
      label: "Editar unidad",
      icon: Pencil,
      tone: "blue",
      onSelect: () => setEditOpen(true),
    },
    {
      key: "delete",
      label: "Eliminar unidad",
      icon: Trash2,
      tone: "red",
      onSelect: () => setDeleteOpen(true),
    },
  ];

  return (
    <>
      <SettingsRowActions actions={actions} tourId="unidades-primary-actions" />

      {/* ── Editar ── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent
          className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Editar unidad</DialogTitle>
            <DialogDescription>
              Modifique lo necesario de{" "}
              <span className="font-medium text-foreground">{unit.label}</span>;
              solo se guardará lo que cambie.
            </DialogDescription>
          </DialogHeader>
          <UpdateUnitForm unit={unit} onClose={() => setEditOpen(false)} />
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar unidad"
        entityName={unit.label}
        isPending={deleteUnit.isPending}
        onConfirm={() => deleteUnit.mutateAsync(unit.id)}
      />
    </>
  );
};

export default UnitDropdownActions;
