"use client";

import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useDeleteClient } from "@/actions/mantenimiento/clientes/actions";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import {
  SettingsRowActions,
  type RowAction,
} from "@/components/dropdowns/SettingsRowActions";
import { EditClientForm } from "@/components/forms/mantenimiento/clientes/EditClientForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { AeronauticalClient } from "@/types";

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

const ClientDropdownActions = ({ client }: { client: AeronauticalClient }) => {
  const { selectedCompany } = useCompanyStore();
  const { deleteClient } = useDeleteClient();
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
      label: "Editar cliente",
      icon: Pencil,
      tone: "blue",
      onSelect: () => setOpenEdit(true),
    },
    {
      key: "delete",
      label: "Eliminar cliente",
      icon: Trash2,
      tone: "red",
      onSelect: () => setOpenDelete(true),
    },
  ];

  return (
    <>
      <SettingsRowActions actions={actions} tourId="clientes-actions" />

      <Dialog open={openDetails} onOpenChange={setOpenDetails}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{client.name}</DialogTitle>
            <DialogDescription>
              {client.dni
                ? `${client.dni_type}-${client.dni}`
                : "Sin documento"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-2">
            <Field label="Teléfono" value={client.phone || "—"} />
            <Field label="Correo" value={client.email || "—"} />
            <Field
              label="Tipo de cliente"
              value={
                client.authorizing === "PROPIETARIO"
                  ? "Propietario"
                  : client.authorizing === "EXPLOTADOR"
                    ? "Explotador"
                    : "—"
              }
            />
            <Field
              label="Dirección"
              value={client.address || "—"}
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
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Editar cliente</DialogTitle>
            <DialogDescription>
              Modifique la información de{" "}
              <span className="font-medium text-foreground">{client.name}</span>
            </DialogDescription>
          </DialogHeader>
          <EditClientForm client={client} onClose={() => setOpenEdit(false)} />
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title="Eliminar cliente"
        entityName={client.name}
        isPending={deleteClient.isPending}
        onConfirm={() =>
          deleteClient.mutateAsync({
            id: client.id.toString(),
            company: selectedCompany!.slug,
          })
        }
      />
    </>
  );
};

export default ClientDropdownActions;
