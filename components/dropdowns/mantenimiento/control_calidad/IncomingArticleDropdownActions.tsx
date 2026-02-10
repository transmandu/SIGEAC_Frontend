import { IncomingArticle } from "@/app/[company]/control_calidad/incoming/[id]/IncomingTypes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { useCompanyStore } from "@/stores/CompanyStore"
import { ClipboardCheck, EyeIcon, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { Button } from "../../../ui/button"

const IncomingArticleDropdownActions
 = ({ article }: { article: IncomingArticle }) => {
  const { selectedCompany } = useCompanyStore()
  return (
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="flex gap-2 justify-center">
          <DropdownMenuItem >
            <Link href={`/${selectedCompany?.slug}/control_calidad/incoming/${article.id}`} className="flex items-center text-green-600 hover:text-green-800 transition-colors">
            <ClipboardCheck className="size-5" />
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
  )
}

export default IncomingArticleDropdownActions
