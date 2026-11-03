"use client";

import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { useState } from "react";
import { Eye, Pencil, Trash2, UserRound } from "lucide-react";
import { useDeleteClient } from "@/actions/mantenimiento/clientes/actions";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import {
  SettingsRowActions,
  type RowAction,
} from "@/components/dropdowns/SettingsRowActions";
import { EditClientForm } from "@/components/forms/mantenimiento/clientes/EditClientForm";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { AeronauticalClient } from "@/types";
import { formatPhone } from "@/lib/phone";

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
        <FormDialogContent
          icon={UserRound}
          title={client.name}
          description={
            <>
              {client.dni
                ? `${client.dni_type}-${client.dni}`
                : "Sin documento"}
            </>
          }
          footer={
            <Button variant="outline" onClick={() => setOpenDetails(false)}>
              Cerrar
            </Button>
          }
          lockOutside={false}
          className="sm:max-w-md"
        >
          <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
            <Field label="Teléfono" value={formatPhone(client.phone) || "—"} />
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
              className="sm:col-span-2"
            />
          </div>
        </FormDialogContent>
      </Dialog>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <FormDialogContent
          icon={UserRound}
          title="Editar cliente"
          description={
            <>
              Modifique lo necesario de{" "}
              <span className="font-medium text-foreground">{client.name}</span>{" "}
              ; solo se guardará lo que cambie.
            </>
          }
          className="sm:max-w-3xl"
        >
          <EditClientForm client={client} onClose={() => setOpenEdit(false)} />
        </FormDialogContent>
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
