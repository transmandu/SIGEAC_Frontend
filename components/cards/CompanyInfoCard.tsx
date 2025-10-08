import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { cn } from "@/lib/utils"
import { Linkedin, Mail, Navigation } from "lucide-react"
import { Badge } from "../ui/badge"
import { Separator } from "../ui/separator"
import Image from "next/image"
import { User } from "@/types"

const CompanyInfoCard = ({ user }: {
  user: User
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-col-reverse gap-2 md:flex-row md:justify-center md:text-start items-center text-center">
        <div>
          <CardTitle>Transmandu, C.A</CardTitle>
          <CardDescription>
            Resumen general de la empresa.
          </CardDescription>
        </div>
        <Image src={'/LOGO_TRD.png'} width={100} height={100} alt="Logo" />
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-around gap-2">
          <div className="flex gap-2">
            <h3 className="text-muted-foreground">RIF:</h3>
            <p className="text-clip">J-91039801</p>
          </div>
        </div>
        <Separator />
        <div className="flex flex-col items-center gap-2 justify-around">
          <div className="flex gap-2">
            <h3 className="text-muted-foreground">TLF:</h3>
            <p>+58 0286-9934134</p>
          </div>
          <div className="flex gap-2">
            <Mail className="size-4 hover:scale-110 hover:text-primary/90 cursor-pointer transition-all ease-in" />
            <Linkedin className="size-4 hover:scale-110 hover:text-primary/90 cursor-pointer transition-all ease-in" />
          </div>
        </div>
        <Separator />
        <div className="flex justify-center gap-2">
          <h3 className="text-muted-foreground">Email:</h3>
          <p>tmd@example.com</p>
        </div>

        <Separator />
        <div className="flex justify-around gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex gap-2">
                  <p className="flex gap-2 cursor-pointer text-muted-foreground text-sm text-center hover:text-primary/90 hover:scale-105 transition-all ease-in duration-100">76MM+CXV, Av Guayana, Ciudad Guayana 8050, Bolívar</p>
                </div>
              </TooltipTrigger>
              <TooltipContent className="flex gap-1 items-center">
                <p>Ir a <span className="text-blue-600">M</span><span className="text-red-500">a</span><span className="text-yellow-500">p</span><span className="text-blue-600">s</span></p>
                <Navigation className="size-3 animate-bounce" />
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Separator />
      </CardContent>
      <CardFooter className="flex justify-center">
        <Badge className={cn('text-[10px]', user.isActive.toString() === '1' ? "bg-emerald-500" : "bg-rose-500")}>{user.isActive.toString() === '1' ? "ACTIVO" : "INACTIVO"}</Badge>
      </CardFooter>
    </Card>
  )
}

export default CompanyInfoCard
