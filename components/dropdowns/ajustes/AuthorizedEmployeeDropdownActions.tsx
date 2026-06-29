"use client"

import { useState } from 'react'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

import DeleteAuthorizedEmployeeDialog from '@/components/dialogs/ajustes/DeleteAuthorizedEmployeeDialog'
import { AuthorizedEmployee } from '@/app/sistema/autorizaciones/autorizar/columns'

interface Props {
  authorizedEmployee: AuthorizedEmployee
}

const AuthorizedEmployeeDropdownActions = ({ authorizedEmployee }: Props) => {
  const [openDelete, setOpenDelete] = useState(false)

  return (
    <TooltipProvider delayDuration={120}>
      <>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpenDelete(true)}
              className="
                size-8
                rounded-xl
                border border-transparent
                text-red-600
                transition-all duration-200
                hover:bg-red-500/10
                hover:border-red-500/20
              "
            >
              <Trash2 className="size-4" />
            </Button>
          </TooltipTrigger>

          <TooltipContent>
            Eliminar autorización
          </TooltipContent>
        </Tooltip>

        <DeleteAuthorizedEmployeeDialog
          authorizedEmployee={authorizedEmployee}
          open={openDelete}
          setOpen={setOpenDelete}
        />
      </>
    </TooltipProvider>
  )
}

export default AuthorizedEmployeeDropdownActions
