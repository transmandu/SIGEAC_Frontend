"use client"

import { useState } from "react"
import { useCompanyStore } from "@/stores/CompanyStore"
import { Vendor } from "@/types"

import {
  useUpdateVendor,
  useDeleteVendor
} from "@/actions/ajustes/globales/proveedores/actions"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"

import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit3, Trash2, Loader2 } from "lucide-react"

import VendorDropdownDialogs from "@/components/dialogs/general/VendorDropdownDialogs"

const iconBase =
  "size-[18px] transition-all duration-200 ease-out group-hover:scale-110"

const itemBase = `
  group
  flex items-center justify-center
  size-9
  rounded-xl
  transition-all duration-200 ease-out
  hover:bg-muted hover:shadow-sm
  active:scale-95
`

const VendorDropdownActions = ({ vendor }: { vendor: Vendor }) => {
  const { selectedCompany } = useCompanyStore()

  const updateMutation = useUpdateVendor(selectedCompany?.slug)
  const deleteMutation = useDeleteVendor(selectedCompany?.slug)

  const [openDropdown, setOpenDropdown] = useState(false)

  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)

  if (!selectedCompany) return null

  const isDeleting = deleteMutation.status === "pending"

  return (
    <TooltipProvider delayDuration={120}>
      <>
        <DropdownMenu open={openDropdown} onOpenChange={setOpenDropdown}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="
                size-8
                rounded-xl
                border border-transparent
                transition-all duration-200
                hover:bg-muted/70
                hover:border-border/50
                hover:shadow-sm
                data-[state=open]:bg-muted
              "
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="center"
            sideOffset={3}
            className="
              flex items-center justify-center gap-1.5
              rounded-2xl
              border border-border/50
              bg-background/90
              backdrop-blur-xl
              shadow-xl
              p-1.5
              animate-in fade-in zoom-in-95 duration-200
              overflow-visible
            "
          >
            {/* EDIT */}
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <DropdownMenuItem asChild className="p-0 focus:bg-transparent">
                    <button
                      onClick={() => {
                        setOpenDropdown(false)
                        setOpenEdit(true)
                      }}
                      className={`${itemBase} text-blue-600`}
                    >
                      <Edit3 className={iconBase} />
                    </button>
                  </DropdownMenuItem>
                </span>
              </TooltipTrigger>

              <TooltipContent>Editar proveedor</TooltipContent>
            </Tooltip>

            {/* DELETE */}
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <DropdownMenuItem asChild className="p-0 focus:bg-transparent">
                    <button
                      onClick={() => {
                        setOpenDropdown(false)
                        setOpenDelete(true)
                      }}
                      className={`${itemBase} text-red-600`}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className={`${iconBase} animate-spin`} />
                      ) : (
                        <Trash2 className={iconBase} />
                      )}
                    </button>
                  </DropdownMenuItem>
                </span>
              </TooltipTrigger>

              <TooltipContent>Eliminar proveedor</TooltipContent>
            </Tooltip>
          </DropdownMenuContent>
        </DropdownMenu>

        <VendorDropdownDialogs
          vendor={vendor}
          openEdit={openEdit}
          setOpenEdit={setOpenEdit}
          openDelete={openDelete}
          setOpenDelete={setOpenDelete}
        />
      </>
    </TooltipProvider>
  )
}

export default VendorDropdownActions
