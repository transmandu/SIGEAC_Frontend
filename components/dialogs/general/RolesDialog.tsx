'use client'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Permission } from "@/types"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface RolesDialogProps {
  roles: {
    id: number,
    name: string,
    label?: string,
    company_id?: string | null,
    permissions?: Permission[]
  }[];
  companies?: { id: number; name: string }[];
  names: string;
}

const RolesDialog = ({ roles, names, companies = [] }: RolesDialogProps) => {
  const router = useRouter()
  return (
    <Dialog >
      <DialogTrigger>
        <Button variant='ghost'>Ver Roles</Button>
      </DialogTrigger>
      <DialogContent>
        <div className="mx-auto w-full">
          <DialogHeader className="flex flex-row justify-between items-center">
            <div className="flex flex-col gap-1">
              <DialogTitle>Roles para: <span className="text-3xl">{names}</span></DialogTitle>
              <DialogDescription>Aquí puede ver los permisos asignados al rol.</DialogDescription>
            </div>
            <Image src={'/LOGO_TRD.png'} className="w-[70px] h-[70px]" width={70} height={70} alt="logo" />
          </DialogHeader>
          <div className="p-4 pb-4">
            <div className="flex flex-col gap-4">
              {
                roles.map(role => {
                  const company = companies.find((c) => String(c.id) === String(role.company_id))
                  return (
                    <div onClick={() => router.push('/administracion/usuarios_permisos/roles')} key={role.id} className="flex flex-col border border-border items-center justify-center p-3 rounded-md shadow-sm hover:scale-105 hover:bg-accent transition-all hover:cursor-pointer gap-1">
                      {company && (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground font-medium">
                          {company.name}
                        </Badge>
                      )}
                      <h3 className="text-base font-semibold text-center">{role.label ?? role.name}</h3>
                      {role.permissions && role.permissions.length > 0 && (
                        <div className="flex gap-2 flex-wrap justify-center">
                          {role.permissions.map((permission) => (
                            <Badge key={permission.id}>{permission.label}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })
              }
            </div>
          </div>
          <DialogFooter>
            <DialogClose>
              <Button variant="outline">Cerrar</Button>
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default RolesDialog
