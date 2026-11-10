"use client";

import { useState } from "react";
import { MapPin, Pencil, Trash2 } from "lucide-react";

import { useDeleteLocation } from "@/actions/ajustes/ubicaciones/actions";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import {
  SettingsRowActions,
  type RowAction,
} from "@/components/dropdowns/SettingsRowActions";
import UpdateLocationForm from "@/components/forms/ajustes/UpdateLocationForm";
import { Dialog } from "@/components/ui/dialog";
import { locationLabel } from "@/lib/locations";
import type { Location } from "@/types";

const LocationDropdownActions = ({ location }: { location: Location }) => {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { deleteLocation } = useDeleteLocation();

  const actions: RowAction[] = [
    {
      key: "edit",
      label: "Editar sede",
      icon: Pencil,
      tone: "blue",
      onSelect: () => setEditOpen(true),
    },
    {
      key: "delete",
      label: "Eliminar sede",
      icon: Trash2,
      tone: "red",
      onSelect: () => setDeleteOpen(true),
    },
  ];

  return (
    <>
      <SettingsRowActions actions={actions} />

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <FormDialogContent
          icon={MapPin}
          title="Editar sede"
          description={
            <>
              Modifique lo necesario de{" "}
              <span className="font-medium text-foreground">
                {locationLabel(location)}
              </span>
              ; solo se guardará lo que cambie.
            </>
          }
          className="sm:max-w-xl"
        >
          <UpdateLocationForm
            location={location}
            onClose={() => setEditOpen(false)}
          />
        </FormDialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar sede"
        entityName={locationLabel(location)}
        warning={
          <>
            Una sede con almacenes, empleados u otros registros asociados no se
            puede eliminar: primero hay que reasignarlos. Tampoco se puede
            eliminar la única sede de la empresa.
          </>
        }
        isPending={deleteLocation.isPending}
        onConfirm={() => deleteLocation.mutateAsync(location.id)}
      />
    </>
  );
};

export default LocationDropdownActions;
