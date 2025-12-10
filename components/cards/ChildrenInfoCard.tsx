import {
  Card,
  CardContent,
  CardFooter,
  CardHeader
} from "@/components/ui/card"
import { ArrowUpRight } from "lucide-react"
import { Button } from "../ui/button"
import { useRouter } from "next/navigation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import Image from "next/image"

interface IChildrenCardProps {
  child_component_id: string,
  child_serial: string,
  child_part_number: string,
  category: string,
  child_zone: string,
  child_image: string,
}

const ChildrenInfo = ({ c, index }: {
  c: IChildrenCardProps,
  index: number,
}) => {
  const router = useRouter();
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Card className="w-[240px] cursor-pointer">
            <CardHeader>
              <h1 className="text-center font-bold">{c.child_serial}</h1>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col text-center">
                <h1 className="underline font-medium">Nro. de Parte</h1>
                <p className="italic text-muted-foreground">{c.child_part_number}</p>
              </div>
              <div className="flex flex-col text-center">
                <h1 className="underline font-medium">Zona de Ubicación</h1>
                <p className="italic text-muted-foreground">{c.child_zone}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center items-center">
              <Button onClick={() => router.push(`/hangar74/almacen/inventario/gestion/${c.child_part_number}/${c.child_serial}`)} className="hover:scale-110 transition-all ease-in duration-100 flex items-center gap-2"><ArrowUpRight className="size-4" />Ir al Componente</Button>
            </CardFooter>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          {c.child_image ? (
            <Image src={`${process.env.NEXT_PUBLIC_STORAGE_BASE_URL}/${c.child_image}`} alt={`Imagen del artículo ${c.child_serial}`} className="max-w-xs max-h-48" width={75} height={75} />
          ) : (
            <p>No hay imagen disponible</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>

  )
}

export default ChildrenInfo
