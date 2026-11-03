"use client";

import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { useDeleteUnit } from "@/actions/ajustes/unidades/actions";
import { Pencil, Trash2, Ruler } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import {
  SettingsRowActions,
  type RowAction,
} from "@/components/dropdowns/SettingsRowActions";
import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
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
        <FormDialogContent
          icon={Ruler}
          title="Editar unidad"
          description={
            <>
              Modifique lo necesario de{" "}
              <span className="font-medium text-foreground">{unit.label}</span>;
              solo se guardará lo que cambie.
            </>
          }
          className="sm:max-w-lg"
        >
          <UpdateUnitForm unit={unit} onClose={() => setEditOpen(false)} />
        </FormDialogContent>
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
