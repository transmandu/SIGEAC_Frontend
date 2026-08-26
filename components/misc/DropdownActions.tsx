import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { EyeIcon, MoreHorizontal, SquarePen, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

const DropdownActions = ({ id }: { id: string | number }) => {
  const router = useRouter()

  return (
    <TooltipProvider>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="flex gap-2 justify-center">
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Tooltip>
              <TooltipTrigger>
                <Trash2 className='size-5 text-red-500' />
              </TooltipTrigger>
              <TooltipContent>
                <p>Eliminar</p>
              </TooltipContent>
            </Tooltip>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            router.push(`/administracion/usuarios_permisos/usuarios/${id}`)
          }}>
            <Tooltip>
              <TooltipTrigger>
                <EyeIcon className="size-5" />
              </TooltipTrigger>
              <TooltipContent>
                Ver
              </TooltipContent>
            </Tooltip>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  )
}

export default DropdownActions
