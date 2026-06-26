"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import {
  AlertTriangle,
  Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ThirdParty } from "@/types"

import { useDeleteThirdParty } from "@/actions/ajustes/globales/terceros/actions"
import UpdateThirdPartyForm from "@/components/forms/general/UpdateThirdPartyForm"

type Props = {
  thirdParty: ThirdParty

  openEdit: boolean
  setOpenEdit: (open: boolean) => void

  openDelete: boolean
  setOpenDelete: (open: boolean) => void
}

const dialogClass =
  "sm:max-w-[390px] rounded-3xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden p-0"

const ThirdPartyDropdownDialogs = ({
  thirdParty,
  openEdit,
  setOpenEdit,
  openDelete,
  setOpenDelete,
}: Props) => {

  const { deleteThirdParty } = useDeleteThirdParty()

  const handleDelete = async () => {
    await deleteThirdParty.mutateAsync(thirdParty.id)
    setOpenDelete(false)
  }

  return (
    <>
      {/* =========================
          EDIT THIRD PARTY
      ========================= */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Editar tercero</DialogTitle>
            <DialogDescription>
              Modifique la información de{" "}
              <span className="font-medium text-foreground">
                {thirdParty.name}
              </span>
            </DialogDescription>
          </DialogHeader>

          <UpdateThirdPartyForm
            thirdParty={thirdParty}
            onClose={() => setOpenEdit(false)}
          />
        </DialogContent>
      </Dialog>

      {/* =========================
          DELETE THIRD PARTY
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
              Eliminar tercero
            </DialogTitle>

            <DialogDescription className="text-sm text-muted-foreground text-center leading-relaxed max-w-sm">
              Vas a eliminar el tercero{" "}
              <span className="font-medium text-foreground">
                {thirdParty.name}
              </span>
            </DialogDescription>

          </DialogHeader>

          <div className="mx-6 mt-4 p-3 rounded-xl border border-red-500/20 bg-red-500/[0.05] text-sm text-red-600 flex gap-2 leading-relaxed">
            <AlertTriangle className="size-4 mt-[2px]" />
            <div>
              Esta acción es <b>irreversible</b> y eliminará permanentemente el registro del sistema.
            </div>
          </div>

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
              disabled={deleteThirdParty.isPending}
              className="
                rounded-xl
                bg-red-600/90
                hover:bg-red-600
              "
            >
              {deleteThirdParty.isPending && (
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

export default ThirdPartyDropdownDialogs
