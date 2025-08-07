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
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Separator } from "@/components/ui/separator"

interface DialogProps {
  permissions: Permission[],
  roleName: string,
}

const PermissionsDialog = ({ permissions, roleName }: DialogProps) => {
  const router = useRouter();
  // Agrupamos permisos por módulo
  const groupedByModule = permissions.reduce((acc, permission) => {
    permission.modules.forEach(module => {
      if (!acc[module.id]) {
        acc[module.id] = {
          ...module,
          permissions: []
        };
      }
      acc[module.id].permissions.push(permission);
    });
    return acc;
  }, {} as Record<number, { id: number, name: string, description: string, permissions: Permission[] }>);
  return (
    <Dialog>
      <DialogTrigger>
        <Button variant='ghost'>Ver Permisos</Button>
      </DialogTrigger>
      <DialogContent>
        <div className="mx-auto w-full max-w-md">
          <DialogHeader className="flex flex-row justify-between items-center">
            <div className="flex flex-col gap-1">
              <DialogTitle>Permisos para: {roleName}</DialogTitle>
              <DialogDescription>Aquí puede ver los permisos asignados al rol.</DialogDescription>
            </div>
            <Image src={'/LOGO_TRD.png'} className="w-[70px] h-[70px]" width={70} height={70} alt="logo" />
          </DialogHeader>
          <div className="p-4 pb-0">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {
                Object.values(groupedByModule).map(module => (
                  <div key={module.id} className="border p-4 rounded-lg shadow-sm w-[320px]">
                    <h3 className="text-lg font-semibold text-center ">{module.name}
                      <Separator className="m-1" />
                    </h3>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                      {
                        module.permissions.map(permission => (
                          <div key={permission.id} className="flex items-center justify-center">
                            <Badge onClick={() => router.push('/administracion/permisos')} variant="default" className="cursor-pointer justify-center text-center md:p-2 text-xs ">{permission.label}</Badge>
                          </div>
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

export default PermissionsDialog;
