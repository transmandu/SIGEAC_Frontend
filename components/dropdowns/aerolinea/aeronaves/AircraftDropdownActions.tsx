"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useDeleteAircraft } from "@/actions/aerolinea/aeronaves/actions";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import {
  SettingsRowActions,
  type RowAction,
} from "@/components/dropdowns/SettingsRowActions";
import { EditAircraftForm } from "@/components/forms/aerolinea/aeronaves/EditAircraftForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AIRCRAFT_STATUS_LABELS, parseApiDate } from "@/lib/airline-aircraft";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { AirlineAircraft } from "@/types";

const Field = ({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) => (
  <div className={className}>
    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
      {label}
    </p>
    <p className="text-sm font-medium">{value}</p>
  </div>
);

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

      <Dialog open={openDetails} onOpenChange={setOpenDetails}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{aircraft.acronym}</DialogTitle>
            <DialogDescription>
              {aircraft.brand} {aircraft.model}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-2">
            <Field label="Serial" value={aircraft.serial} />
            <Field
              label="Estado"
              value={AIRCRAFT_STATUS_LABELS[aircraft.status] ?? aircraft.status}
            />
            <Field label="Propietario" value={aircraft.owner} />
            <Field
              label="Fabricante"
              value={
                aircraft.manufacturer
                  ? aircraft.manufacturer.description ||
                    aircraft.manufacturer.name
                  : "—"
              }
            />
            <Field
              label="Ubicación"
              value={
                aircraft.location
                  ? aircraft.location.name || aircraft.location.address
                  : "—"
              }
            />
            <Field
              label="Fabricada"
              value={format(parseApiDate(aircraft.fabricant_date), "PPP", {
                locale: es,
              })}
            />
            <Field
              label="Tipo"
              value={aircraft.is_external ? "Externa" : "Flota propia"}
            />
            <Field
              label="Registro INAC"
              value={aircraft.inac ? "Registrada" : "No registrada"}
            />
            <Field
              label="Comentarios"
              value={aircraft.comments || "—"}
              className="col-span-2"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setOpenDetails(false)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent
          className="max-h-[90vh] overflow-y-auto sm:max-w-4xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Editar aeronave</DialogTitle>
            <DialogDescription>
              Modifique lo necesario de{" "}
              <span className="font-medium text-foreground">
                {aircraft.acronym}
              </span>
              ; solo se guardará lo que cambie.
            </DialogDescription>
          </DialogHeader>
          <EditAircraftForm
            aircraft={aircraft}
            onClose={() => setOpenEdit(false)}
          />
        </DialogContent>
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
