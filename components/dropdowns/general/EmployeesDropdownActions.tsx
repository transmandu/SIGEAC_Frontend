"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Minus,
  RotateCcw,
} from "lucide-react"

import { useState } from "react"
import { Employee } from "@/types"
import { useCompanyStore } from "@/stores/CompanyStore"

import { useDeleteEmployee } from "@/actions/general/empleados/actions"
import { useDeactivateEmployee } from "@/hooks/sistema/empleados/useDeactivateEmployee"
import { useReactivateEmployee } from "@/hooks/sistema/empleados/useReactivateEmployee"

import { UpdateEmployeeForm } from "@/components/forms/general/UpdateEmployeeForm"

const EmployeesDropdownActions = ({ employee }: { employee: Employee }) => {
  const [openUpdate, setOpenUpdate] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [openDeactivate, setOpenDeactivate] = useState(false)
  const [openReactivate, setOpenReactivate] = useState(false)

  const { selectedCompany } = useCompanyStore()

  const deleteEmployee = useDeleteEmployee()
  const deactivateEmployee = useDeactivateEmployee()
  const reactivateEmployee = useReactivateEmployee()

  const userRole = "SUPERUSER"
  const isSuperUser = userRole === "SUPERUSER"

  const mode = employee.isActive ? "active" : "inactive"

  const handleDelete = () => {
    if (!selectedCompany) return

    deleteEmployee.mutate({
      id: employee.id,
      company: selectedCompany.slug,
    })
  }

  const handleDeactivate = () => {
    if (!selectedCompany) return

    deactivateEmployee.mutate({
      id: employee.id,
      company: selectedCompany.slug,
    })
  }

  const handleReactivate = () => {
    if (!selectedCompany) return

    reactivateEmployee.mutate({
      id: employee.id,
      company: selectedCompany.slug,
    })
  }

  return (
    <TooltipProvider>
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="flex gap-1 p-1 w-auto min-w-0"
          >
            {mode === "active" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem onClick={() => setOpenUpdate(true)}>
                    <Pencil className="h-4 w-4 text-blue-500" />
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>Editar empleado</TooltipContent>
              </Tooltip>
            )}

            {mode === "active" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem onClick={() => setOpenDeactivate(true)}>
                    <Minus className="h-4 w-4 text-yellow-500" />
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>Desactivar empleado</TooltipContent>
              </Tooltip>
            )}

            {mode === "inactive" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem onClick={() => setOpenReactivate(true)}>
                    <RotateCcw className="h-4 w-4 text-green-500" />
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>Reactivar empleado</TooltipContent>
              </Tooltip>
            )}

            {isSuperUser && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem
                    onClick={() => setOpenDelete(true)}
                    className="text-red-500 focus:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>Eliminar permanentemente</TooltipContent>
              </Tooltip>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* EDITAR */}
        <Dialog open={openUpdate} onOpenChange={setOpenUpdate}>
          <DialogContent className="max-w-lg lg:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-center">
                Actualizar Empleado
              </DialogTitle>
              <DialogDescription className="text-center">
                Modifique la información del empleado.
              </DialogDescription>
            </DialogHeader>

            <UpdateEmployeeForm
              employee={employee}
              onSuccess={() => setOpenUpdate(false)}
            />
          </DialogContent>
        </Dialog>

        {/* DESACTIVAR */}
        <Dialog open={openDeactivate} onOpenChange={setOpenDeactivate}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-yellow-600">
                Desactivar empleado
              </DialogTitle>
              <DialogDescription>
                El empleado será ocultado de operaciones activas, pero podrá ser reactivado posteriormente.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-700">
              Acción reversible. No se eliminan datos del sistema.
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setOpenDeactivate(false)}>
                Cancelar
              </Button>

              <Button
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
                onClick={() => {
                  handleDeactivate()
                  setOpenDeactivate(false)
                }}
              >
                Desactivar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* REACTIVAR */}
        <Dialog open={openReactivate} onOpenChange={setOpenReactivate}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-green-600">
                Reactivar empleado
              </DialogTitle>
              <DialogDescription>
                El empleado volverá a estar activo en el sistema.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              Se restaurará su acceso a operaciones activas.
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setOpenReactivate(false)}>
                Cancelar
              </Button>

              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => {
                  handleReactivate()
                  setOpenReactivate(false)
                }}
              >
                Reactivar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ELIMINAR */}
        <Dialog open={openDelete} onOpenChange={setOpenDelete}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600">
                Eliminar empleado
              </DialogTitle>
              <DialogDescription>
                Esta acción eliminará permanentemente el empleado del sistema.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              Advertencia: esta acción es irreversible y elimina todos los datos asociados.
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setOpenDelete(false)}>
                Cancelar
              </Button>

              <Button
                variant="destructive"
                onClick={() => {
                  handleDelete()
                  setOpenDelete(false)
                }}
              >
                Eliminar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    </TooltipProvider>
  )
}

export default EmployeesDropdownActions