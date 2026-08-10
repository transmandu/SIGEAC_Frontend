'use client'

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
  } from "@/components/ui/drawer"  
import { Permission } from "@/types"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { useRouter } from "next/navigation"

interface DrawerProps {
    permissions: Permission[],
    roleName: string,
}

const PermissionsDrawer = ({ permissions, roleName }: DrawerProps) => {
  const router = useRouter();
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
    <Drawer>
        <DrawerTrigger>
            <Button variant='ghost'>Ver Permisos DRAWER</Button>
        </DrawerTrigger>
        <DrawerContent>
            <div className="mx-auto w-full max-w-md">
                <DrawerHeader>
                    <DrawerTitle>Permisos del rol: {roleName}</DrawerTitle>
                    <DrawerDescription>Aquí puede ver los permisos asignados al rol.</DrawerDescription>
                </DrawerHeader>
                <div className="p-4 pb-0">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {
                            Object.values(groupedByModule).map(module => (
                                <div key={module.id} className="border p-4 rounded-lg shadow-sm w-[300px]">
                                    <h3 className="text-lg font-semibold text-center">{module.name}</h3>
                                    <div className="mt-2 grid grid-cols-1 md:grid-cols-3">
                                        {
                                            module.permissions.map(permission => (
                                                <div key={permission.id} className="mb-1">
                                                    <Badge onClick={() => router.push('/administracion/permisos')} variant="default" className="cursor-pointer">{permission.label}</Badge>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
                <DrawerFooter>
                    <DrawerClose>
                        <Button variant="outline">Cerrar</Button>
                    </DrawerClose>
                </DrawerFooter>
            </div>
        </DrawerContent>
    </Drawer>
  )
}

export default PermissionsDrawer;
