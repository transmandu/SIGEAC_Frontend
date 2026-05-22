"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import {
  Building2,
  AlertTriangle,
  Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Company } from "@/types"

import { useDeleteCompany } from "@/actions/sistema/empresas/actions"
import { CompanyUpdateForm } from "@/components/forms/ajustes/CompanyUpdateForm"

type Props = {
  company: Company

  openEdit: boolean
  setOpenEdit: (open: boolean) => void

  openDelete: boolean
  setOpenDelete: (open: boolean) => void
}

const dialogClass =
  "sm:max-w-[390px] rounded-3xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden p-0"

const CompanyDropdownDialogs = ({
  company,
  openEdit,
  setOpenEdit,
  openDelete,
  setOpenDelete,
}: Props) => {

  const { deleteCompany } = useDeleteCompany()

  const handleDelete = async () => {
    await deleteCompany.mutateAsync(company.id)
    setOpenDelete(false)
  }

  return (
    <>
      {/* =========================
          EDIT COMPANY (placeholder)
      ========================= */}
        <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent
            className="
            sm:max-w-[1100px] w-[95vw]
            max-h-[90vh] overflow-y-auto
            rounded-3xl
            border border-border/50
            bg-background/95 backdrop-blur-xl
            shadow-2xl
            overflow-hidden p-0
            "
        >
            {/* HEADER */}
            <DialogHeader
            className="
                border-b border-border/40
                bg-muted/20
                px-8 pt-8 pb-6
                text-left
            "
            >
            <div className="flex items-start gap-4">

                <div
                className="
                    flex items-center justify-center
                    size-14 shrink-0
                    rounded-2xl
                    border border-blue-500/10
                    bg-blue-500/[0.08]
                "
                >
                <Building2 className="size-6 text-blue-600" />
                </div>

                <div className="space-y-2">
                <DialogTitle className="text-2xl font-semibold tracking-tight">
                    Editar empresa
                </DialogTitle>

                <DialogDescription className="text-sm text-muted-foreground">
                    Modifique la información de{" "}
                    <span className="font-medium text-foreground">
                    {company.name}
                    </span>
                </DialogDescription>
                </div>

            </div>
            </DialogHeader>

            {/* BODY */}
            <div className="px-8 py-6">
            <CompanyUpdateForm
                company={company}
                onSuccess={() => setOpenEdit(false)}
            />
            </div>

        </DialogContent>
        </Dialog>

      {/* =========================
          DELETE COMPANY (CONSISTENTE CON REQUISITION)
      ========================= */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className={dialogClass}>

          <DialogHeader className="px-6 pt-8 pb-3 flex flex-col items-center text-center space-y-3">

            <div
              className="
                flex items-center justify-center
                size-12 rounded-2xl
                border border-red-500/15
                bg-red-500/[0.08]
              "
            >
              <AlertTriangle className="size-5 text-red-600" />
            </div>

            <DialogTitle className="text-[16px] font-semibold tracking-tight">
              Eliminar empresa
            </DialogTitle>

            <DialogDescription className="text-sm text-muted-foreground text-center leading-relaxed max-w-sm">
              Vas a eliminar la empresa{" "}
              <span className="font-medium text-foreground">
                {company.name}
              </span>
            </DialogDescription>

          </DialogHeader>

          {/* WARNING BOX */}
          <div className="mx-6 mt-4 p-3 rounded-xl border border-red-500/20 bg-red-500/[0.05] text-sm text-red-600 flex gap-2 leading-relaxed">
            <AlertTriangle className="size-4 mt-[2px]" />
            <div>
              Esta acción es <b>irreversible</b> y eliminará permanentemente el registro del sistema.
            </div>
          </div>

          {/* ACTIONS */}
          <div className="px-6 pb-6 pt-5 flex justify-end gap-2">

            <Button
              variant="outline"
              onClick={() => setOpenDelete(false)}
              className="
                rounded-xl
                border border-border/60
                bg-background
                hover:bg-muted
                text-muted-foreground
                hover:text-foreground
              "
            >
              Cancelar
            </Button>

            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteCompany.isPending}
              className="
                rounded-xl
                bg-red-600/90
                hover:bg-red-600
              "
            >
              {deleteCompany.isPending && (
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

export default CompanyDropdownDialogs