"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2, Edit3, AlertTriangle } from "lucide-react"
import { ShippingAgency } from "@/types"
import { useCompanyStore } from "@/stores/CompanyStore"
import { useDeleteShippingAgency, useUpdateShippingAgency } from "@/actions/general/agencias_envio/actions"
import { CreateShippingAgencyForm } from "@/components/forms/general/CreateShippingAgencyForm"
import LoadingPage from "@/components/misc/LoadingPage"

const dialogClass = "sm:max-w-[420px] rounded-3xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden p-0"
const header = "px-6 pt-8 pb-3 flex flex-col items-center text-center space-y-3"
const iconBase = (color: "blue" | "red") => `
  flex items-center justify-center
  size-12 rounded-2xl
  border
  ${
    color === "red"
      ? "border-red-500/15 bg-red-500/[0.08] text-red-600"
      : "border-blue-500/15 bg-blue-500/[0.08] text-blue-600"
  }
`
const title = "text-[16px] font-semibold tracking-tight"
const description = "text-sm text-muted-foreground text-center leading-relaxed max-w-sm"
const warningBox = (color: "red") => `
  mx-6 mt-4 p-3 rounded-xl border text-sm leading-relaxed flex gap-2
  ${
    color === "red"
      ? "border-red-500/20 bg-red-500/[0.05] text-red-600"
      : ""
  }
`
const footer = "px-6 pb-6 pt-5 flex justify-end gap-2"
const cancelBtn = "rounded-xl border border-border/60 bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition"
const dangerBtn = "rounded-xl bg-red-600 hover:bg-red-700 text-white"
const primaryBtn = "rounded-xl bg-blue-600 hover:bg-blue-700 text-white"

type Props = {
  agency: ShippingAgency
  openEdit: boolean
  setOpenEdit: (v: boolean) => void
  openDelete: boolean
  setOpenDelete: (v: boolean) => void
}

const ShippingAgencyDropdownDialogs = ({
  agency,
  openEdit,
  setOpenEdit,
  openDelete,
  setOpenDelete
}: Props) => {
  const { selectedCompany } = useCompanyStore()

  const updateMutation = useUpdateShippingAgency(selectedCompany?.slug)
  const deleteMutation = useDeleteShippingAgency(selectedCompany?.slug)
  
  const [loading, setLoading] = useState(false)

  if (!selectedCompany) return <LoadingPage />

  const handleUpdate = async (data: any) => {
    setLoading(true)
    await updateMutation.mutateAsync({
      ...data,
      id: agency.id
    })
    setLoading(false)
    setOpenEdit(false)
  }

  const handleDelete = async () => {
    setLoading(true)
    await deleteMutation.mutateAsync(agency.id)
    setLoading(false)
    setOpenDelete(false)
  }

  return (
    <>
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className={dialogClass}>
          <DialogHeader className={header}>
            <div className={iconBase("blue")}>
              <Edit3 className="size-5" />
            </div>

            <DialogTitle className={title}>
              Editar agencia de envío
            </DialogTitle>

            <DialogDescription className={description}>
              Actualiza la información de{" "}
              <span className="font-medium text-foreground">
                {agency.name}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-4">
            <CreateShippingAgencyForm
              initialValues={{
                name: agency.name,
                code: agency.code,
                description: agency.description ?? "",
                type: agency.type,
                phone: agency.phone ?? "",
                email: agency.email ?? ""
              }}
              onSubmit={handleUpdate}
              onClose={() => setOpenEdit(false)}
              isLoading={updateMutation.isPending || loading}
            />
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className={dialogClass}>
          <DialogHeader className={header}>
            <div className={iconBase("red")}>
              <Trash2 className="size-5" />
            </div>

            <DialogTitle className={title}>
              Eliminar agencia
            </DialogTitle>

            <DialogDescription className={description}>
              La agencia{" "}
              <span className="font-medium text-foreground">
                {agency.name}
              </span>{" "}
              será eliminada permanentemente.
            </DialogDescription>
          </DialogHeader>

          <div className={warningBox("red")}>
            <AlertTriangle className="size-4 mt-[2px]" />
            <div>
              Esta acción es <b>irreversible</b> y eliminará el registro del sistema.
            </div>
          </div>

          <DialogFooter className={footer}>
            <Button
              variant="outline"
              onClick={() => setOpenDelete(false)}
              className={cancelBtn}
            >
              Cancelar
            </Button>

            <Button
              onClick={handleDelete}
              disabled={deleteMutation.isPending || loading}
              className={dangerBtn}
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ShippingAgencyDropdownDialogs