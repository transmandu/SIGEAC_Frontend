"use client"

import { useState } from "react"
import { useCompanyStore } from "@/stores/CompanyStore"
import { ShippingAgency } from "@/types"
import { useUpdateShippingAgency, useDeleteShippingAgency } from "@/actions/general/agencias_envio/actions"
import { DropdownMenuItem, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Loader2, MoreHorizontal, Trash2, Edit3 } from "lucide-react"
import { toast } from "sonner"
import { CreateShippingAgencyForm } from "@/components/forms/general/CreateShippingAgencyForm"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Props {
  agency: ShippingAgency
}

export const ShippingAgencyDropdownActions = ({ agency }: Props) => {
  const { selectedCompany } = useCompanyStore()
  const updateMutation = useUpdateShippingAgency(selectedCompany?.slug)
  const deleteMutation = useDeleteShippingAgency(selectedCompany?.slug)

  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)

  if (!selectedCompany) return null

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync(id)
    setOpenDelete(false)
  }

  const handleUpdate = async (data: any) => {
    await updateMutation.mutateAsync({ ...data, id: agency.id })
    setOpenEdit(false)
  }

  return (
    <TooltipProvider>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="center" className="flex gap-2 justify-center">

          {/* Editar */}
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuItem asChild>
                <Button
                  variant="ghost"
                  className="p-2 h-10 w-10 flex items-center justify-center"
                  onClick={() => setOpenEdit(true)}
                >
                  <Edit3 className="size-5" />
                </Button>
              </DropdownMenuItem>
            </TooltipTrigger>
            <TooltipContent>Editar agencia</TooltipContent>
          </Tooltip>

          {/* Eliminar */}
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuItem asChild>
                <Button
                  variant="ghost"
                  className="p-2 h-10 w-10 flex items-center justify-center"
                  onClick={() => setOpenDelete(true)}
                  disabled={deleteMutation.status === "pending"}
                >
                  {deleteMutation.status === "pending" ? (
                    <Loader2 className="animate-spin size-5 text-red-500" />
                  ) : (
                    <Trash2 className="size-5 text-red-500" />
                  )}
                </Button>
              </DropdownMenuItem>
            </TooltipTrigger>
            <TooltipContent>Eliminar agencia</TooltipContent>
          </Tooltip>

        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialogo de edición */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Agencia de Envío</DialogTitle>
            <DialogDescription>Actualiza la información de esta agencia de envío.</DialogDescription>
          </DialogHeader>

          <CreateShippingAgencyForm
            onClose={() => setOpenEdit(false)}
            initialValues={{
              name: agency.name,
              code: agency.code,
              description: agency.description ?? "",
              type: agency.type,
              phone: agency.phone ?? "",
              email: agency.email ?? "",
            }}
            onSubmit={handleUpdate}
            isLoading={updateMutation.status === "pending"}
          />
        </DialogContent>
      </Dialog>

      {/* Dialogo de eliminación */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="max-w-md">
          <DialogHeader className="flex flex-col items-center text-center space-y-3">
            <div className="flex items-center justify-center size-12 rounded-full bg-red-100 dark:bg-red-900/30">
              <Trash2 className="size-6 text-red-600" />
            </div>

            <DialogTitle className="text-xl font-semibold">
              Eliminar Agencia de Envío
            </DialogTitle>

            <DialogDescription className="text-muted-foreground text-sm max-w-sm">
              ¿Estás seguro de que deseas eliminar <span className="font-semibold">{agency.name}</span>? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpenDelete(false)}>Cancelar</Button>

            <Button
              variant="destructive"
              onClick={() => handleDelete(agency.id)}
              disabled={deleteMutation.status === "pending"}
              className="flex items-center gap-2"
            >
              {deleteMutation.status === "pending" && <Loader2 className="animate-spin size-4" />}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}