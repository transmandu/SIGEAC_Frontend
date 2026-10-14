"use client"

import { useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { useDeleteWarehouse } from "@/actions/mantenimiento/almacen/almacenes/actions"
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog"
import {
  SettingsRowActions,
  type RowAction,
} from "@/components/dropdowns/SettingsRowActions"
import CreateWarehouseForm from "@/components/forms/ajustes/CreateWarehouseForm"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useCompanyStore } from "@/stores/CompanyStore"
import { Warehouse } from "@/types"

const WarehouseDropdownActions = ({ warehouse }: { warehouse: Warehouse }) => {
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const { selectedCompany } = useCompanyStore()
  const { deleteWarehouse } = useDeleteWarehouse()

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
      onSelect: () => setOpenDelete(true),
    },
  ]

  return (
    <>
      <SettingsRowActions actions={actions} />

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-105">
          <DialogHeader>
            <DialogTitle>Editar almacén</DialogTitle>
            <DialogDescription>
              Modifique la información de{" "}
              <span className="font-medium text-foreground">{warehouse.name}</span>
            </DialogDescription>
          </DialogHeader>
          <CreateWarehouseForm warehouse={warehouse} onClose={() => setOpenEdit(false)} />
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title="Eliminar almacén"
        entityName={warehouse.name}
        warning={<>Solo se puede eliminar un almacén <b>sin artículos</b> registrados.</>}
        isPending={deleteWarehouse.isPending}
        onConfirm={() =>
          deleteWarehouse.mutateAsync({ company: selectedCompany!.slug, id: warehouse.id })
        }
      />
    </>
  )
}

export default WarehouseDropdownActions
