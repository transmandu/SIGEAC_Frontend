"use client"

import { useState } from "react"
import { Department } from "@/types"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"

import {
  Loader2,
  Trash2,
  Pencil,
  AlertTriangle,
} from "lucide-react"

import {
  useDeleteDepartment,
  useUpdateDepartment,
} from "@/actions/general/departamento/actions"
import { UpdateDepartmentForm } from "@/components/forms/general/UpdateDepartmentForm"
import { useCompanyStore } from "@/stores/CompanyStore"

type Props = {
  department: Department

  openEdit: boolean
  setOpenEdit: (open: boolean) => void

  openDelete: boolean
  setOpenDelete: (open: boolean) => void

  onSuccessUpdate?: () => void
  onSuccessDelete?: () => void
}

const dialogClass =
  "sm:max-w-3xl rounded-3xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden p-0"

const DepartmentDropdownDialogs = ({
  department,
  openEdit,
  setOpenEdit,
  openDelete,
  setOpenDelete,
  onSuccessUpdate,
  onSuccessDelete,
}: Props) => {
  const { selectedCompany } = useCompanyStore()

  const { deleteDepartment } = useDeleteDepartment()
  const { updateDepartment } = useUpdateDepartment()

  const [loadingDelete, setLoadingDelete] = useState(false)
  const [loadingUpdate, setLoadingUpdate] = useState(false)

  /* =========================
     DELETE
  ========================= */
  const handleDelete = async () => {
    if (!selectedCompany) return

    try {
      setLoadingDelete(true)

      await deleteDepartment.mutateAsync({
        id: department.id,
        company: selectedCompany.slug,
      })

      setOpenDelete(false)
      onSuccessDelete?.()
    } finally {
      setLoadingDelete(false)
    }
  }

  /* =========================
     UPDATE (rápido placeholder)
  ========================= */
  const handleUpdate = async () => {
    if (!selectedCompany) return

    try {
      setLoadingUpdate(true)

      await updateDepartment.mutateAsync({
        id: department.id,
        acronym: department.acronym,
        name: department.name,
        email: department.email,
        company: selectedCompany.slug,
      })

      setOpenEdit(false)
      onSuccessUpdate?.()
    } finally {
      setLoadingUpdate(false)
    }
  }

  return (
    <>
      {/* =========================
          EDIT
      ========================= */}
    <Dialog open={openEdit} onOpenChange={setOpenEdit}>
    <DialogContent className={dialogClass}>
        <DialogHeader
        className="
            border-b border-border/40
            bg-muted/20
            px-8 pt-8 pb-6
            text-left
        "
        >
        <div className="flex items-start gap-4">
            <div className="flex items-center justify-center size-14 rounded-2xl bg-blue-500/[0.08] border border-blue-500/10">
            <Pencil className="size-6 text-blue-600" />
            </div>

            <div className="space-y-2">
            <DialogTitle className="text-2xl font-semibold">
                Editar departamento
            </DialogTitle>

            <DialogDescription className="text-sm text-muted-foreground">
                Edita el departamento{" "}
                <span className="font-medium text-foreground">
                {department.name}
                </span>
            </DialogDescription>
            </div>
        </div>
        </DialogHeader>

        <div className="px-8 py-6">
        <UpdateDepartmentForm
            department={department}
            onClose={() => setOpenEdit(false)}
            onSuccess={() => {
            setOpenEdit(false)
            onSuccessUpdate?.()
            }}
        />
        </div>
    </DialogContent>
    </Dialog>

      {/* =========================
          DELETE
      ========================= */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className={dialogClass}>
          <DialogHeader className="px-6 pt-8 pb-3 flex flex-col items-center text-center space-y-3">
            <div className="flex items-center justify-center size-12 rounded-2xl bg-red-500/[0.08] border border-red-500/15">
              <Trash2 className="size-5 text-red-600" />
            </div>

            <DialogTitle className="text-[16px] font-semibold">
              Eliminar departamento
            </DialogTitle>

            <DialogDescription>
              ¿Eliminar{" "}
              <span className="font-medium text-foreground">
                {department.name}
              </span>
              ?
            </DialogDescription>
          </DialogHeader>

          <div className="mx-6 mt-4 p-3 rounded-xl border border-red-500/20 bg-red-500/[0.05] text-sm text-red-600 flex gap-2">
            <AlertTriangle className="size-4 mt-[2px]" />
            Esta acción no se puede deshacer.
          </div>

          <div className="px-6 pb-6 pt-5 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpenDelete(false)}
            >
              Cancelar
            </Button>

            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loadingDelete}
            >
              {loadingDelete && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default DepartmentDropdownDialogs