"use client";

import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { useState } from "react";
import { Pencil, Trash2, Warehouse as WarehouseIcon } from "lucide-react";
import { toast } from "sonner";
import { useDeleteWarehouse } from "@/actions/mantenimiento/almacen/almacenes/actions";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import {
  SettingsRowActions,
  type RowAction,
} from "@/components/dropdowns/SettingsRowActions";
import CreateWarehouseForm from "@/components/forms/ajustes/CreateWarehouseForm";
import { Dialog } from "@/components/ui/dialog";
import { useIsSuperuser } from "@/hooks/helpers/useIsSuperuser";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Warehouse } from "@/types";

const WarehouseDropdownActions = ({ warehouse }: { warehouse: Warehouse }) => {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const { selectedCompany } = useCompanyStore();
  const { deleteWarehouse } = useDeleteWarehouse();
  const recordCount = warehouse.records_count ?? 0;
  const isSuperuser = useIsSuperuser();

  const actions: RowAction[] = [
    {
      key: "edit",
      label: "Editar almacén",
      icon: Pencil,
      tone: "blue",
      onSelect: () => setOpenEdit(true),
    },
    {
      key: "delete",
      label: "Eliminar almacén",
      icon: Trash2,
      tone: "red",
      onSelect: () => {
        // Con registros el servidor lo rechaza; se avisa antes de abrir el diálogo.
        if (recordCount > 0) {
          toast.warning("No se puede eliminar este almacén", {
            description: `Tiene ${recordCount} ${
              recordCount === 1 ? "registro" : "registros"
            } (renglones, artículos generales, recepciones o inspecciones). Un almacén con historial no se elimina.`,
          });
          return;
        }
        setOpenDelete(true);
      },
    },
  ];

  // Crear, editar y eliminar almacenes es solo de SUPERUSER.
  if (!isSuperuser) return null;

  return (
    <>
      <SettingsRowActions actions={actions} />

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <FormDialogContent
          icon={WarehouseIcon}
          title="Editar almacén"
          description={
            <>
              Modifique la información de{" "}
              <span className="font-medium text-foreground">
                {warehouse.name}
              </span>
            </>
          }
          className="sm:max-w-lg"
        >
          <CreateWarehouseForm
            warehouse={warehouse}
            onClose={() => setOpenEdit(false)}
          />
        </FormDialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title="Eliminar almacén"
        entityName={warehouse.name}
        warning="El almacén no tiene registros, así que se elimina sin afectar al inventario."
        isPending={deleteWarehouse.isPending}
        onConfirm={() =>
          deleteWarehouse.mutateAsync({
            company: selectedCompany!.slug,
            id: warehouse.id,
          })
        }
      />
    </>
  );
};

export default WarehouseDropdownActions;
