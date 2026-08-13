import { IncomingArticle } from "@/app/[company]/control_calidad/incoming/IncomingTypes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useCompanyStore } from "@/stores/CompanyStore"
import { ClipboardCheck, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { Button } from "../../../ui/button"

const IncomingArticleDropdownActions
 = ({ article }: { article: IncomingArticle }) => {
  const { selectedCompany } = useCompanyStore()

  // Un artículo corregido por compras vuelve a inspección: es la misma pantalla,
  // pero conviene que la acción lo diga para no leerse como un incoming nuevo.
  const isReinspection = article.status?.toUpperCase() === "PENDING_REINSPECTION"

  return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="flex gap-2 justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuItem>
                <Link href={`/${selectedCompany?.slug}/control_calidad/incoming/${article.id}`} className="flex items-center text-green-600 hover:text-green-800 transition-colors">
                <ClipboardCheck className="size-5" />
                </Link>
              </DropdownMenuItem>
            </TooltipTrigger>
            <TooltipContent>
              {isReinspection ? "Re-inspeccionar artículo" : "Realizar inspección"}
            </TooltipContent>
          </Tooltip>
        </DropdownMenuContent>
      </DropdownMenu>
  )
}

export default IncomingArticleDropdownActions
