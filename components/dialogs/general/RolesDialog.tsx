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
import { Permission, Role } from "@/types"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface RolesDialogProps {
  roles: {
    id: number,
    name: string,
    permissions: Permission[]
  }[];
  names: string;
}

const RolesDialog = ({ roles, names }: RolesDialogProps) => {
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
                roles.map(role => (
                  <div onClick={() => router.push('/administracion/usuarios_permisos/roles')} key={role.id} className="flex flex-col border border-black items-center justify-center p-2 rounded-md shadow-sm hover:scale-105 hover:bg-sky-100 transition-all hover:cursor-pointer">
                    <h3 className="text-lg font-semibold text-center ">{role.name}
                    </h3>
                    <div className="flex gap-2">
                      {
                        role.permissions.map((permission) => (
                          <Badge key={permission.id}>{permission.label}</Badge>
                        ))
                      }
                    </div>
                  </div>
                ))
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
