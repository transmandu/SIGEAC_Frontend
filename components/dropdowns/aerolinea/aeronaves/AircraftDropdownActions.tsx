"use client";

import { useState } from "react";
import { Eye, Pencil, Plane, Trash2 } from "lucide-react";

import { useDeleteAircraft } from "@/actions/aerolinea/aeronaves/actions";
import { AircraftDetailDialog } from "@/components/dialogs/aerolinea/aeronaves/AircraftDetailDialog";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import {
  SettingsRowActions,
  type RowAction,
} from "@/components/dropdowns/SettingsRowActions";
import { EditAircraftForm } from "@/components/forms/aerolinea/aeronaves/EditAircraftForm";
import { Dialog } from "@/components/ui/dialog";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { AirlineAircraft } from "@/types";

const AircraftDropdownActions = ({
  aircraft,
}: {
  aircraft: AirlineAircraft;
}) => {
  const { selectedCompany } = useCompanyStore();
  const { deleteAircraft } = useDeleteAircraft();
  const [openDetails, setOpenDetails] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const actions: RowAction[] = [
    {
      key: "details",
      label: "Ver detalle",
      icon: Eye,
      onSelect: () => setOpenDetails(true),
    },
    {
      key: "edit",
      label: "Editar aeronave",
      icon: Pencil,
      tone: "blue",
      onSelect: () => setOpenEdit(true),
    },
    {
      key: "delete",
      label: "Eliminar aeronave",
      icon: Trash2,
      tone: "red",
      onSelect: () => setOpenDelete(true),
    },
  ];

  return (
    <>
      <SettingsRowActions actions={actions} tourId="aeronaves-actions" />

      <AircraftDetailDialog
        aircraft={aircraft}
        open={openDetails}
        onOpenChange={setOpenDetails}
        onEdit={() => {
          setOpenDetails(false);
          setOpenEdit(true);
        }}
      />

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <FormDialogContent
          icon={Plane}
          title="Editar aeronave"
          description={
            <>
              Modifique lo necesario de{" "}
              <span className="font-medium text-foreground">
                {aircraft.acronym}
              </span>
              ; solo se guardará lo que cambie.
            </>
          }
          className="sm:max-w-4xl"
        >
          <EditAircraftForm
            aircraft={aircraft}
            onClose={() => setOpenEdit(false)}
          />
        </FormDialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title="Eliminar aeronave"
        entityName={aircraft.acronym}
        isPending={deleteAircraft.isPending}
        warning={
          <>
            Solo se puede eliminar si no tiene guías de carga, manifiestos,
            reportes de SMS ni requisiciones. Si ya tiene historia, cambie su
            estado en lugar de eliminarla.
          </>
        }
        onConfirm={() =>
          deleteAircraft.mutateAsync({
            company: selectedCompany!.slug,
            acronym: aircraft.acronym,
          })
        }
      />
    </>
  );
};

export default AircraftDropdownActions;
