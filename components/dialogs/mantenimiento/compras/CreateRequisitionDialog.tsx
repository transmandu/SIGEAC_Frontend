'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import { CreateEngineeringBatchRequisitionForm } from "@/components/forms/mantenimiento/compras/CreateEngineeringBatchRequisitionForm"
import { CreateGeneralBatchRequisitionForm } from "@/components/forms/mantenimiento/compras/CreateGeneralBatchRequisitionForm"
import { CreateGeneralArticleRequisitionForm } from "@/components/forms/mantenimiento/compras/CreateGeneralArticleRequisitionForm"

type Role = string

export function CreateRequisitionDialog() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  const userRoles: Role[] = user?.roles?.map(role => role.name) || []
  const isEngineering = userRoles.includes("ENGINEERING")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setOpen(true)}
          variant="outline"
          className="flex items-center justify-center gap-2 h-8 border-dashed"
        >
          Nueva Solicitud
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[680px]">
        <DialogHeader>
          <DialogTitle>Creación de Sol. de Compra</DialogTitle>
          <DialogDescription>
            Seleccione el tipo de solicitud que desea crear
          </DialogDescription>
        </DialogHeader>

        {/* ================= ENGINEERING ================= */}
        {isEngineering ? (
          <CreateEngineeringBatchRequisitionForm
            onClose={() => setOpen(false)}
          />
        ) : (
          /* ================= OTROS ROLES ================= */
          <Tabs defaultValue="batch" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="batch">
                Lote
              </TabsTrigger>
              <TabsTrigger value="articulo">
                Artículo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="batch" className="mt-4">
              <CreateGeneralBatchRequisitionForm
                isEditing={false}
                onClose={() => setOpen(false)}
              />
            </TabsContent>

            <TabsContent value="articulo" className="mt-4">
              <CreateGeneralArticleRequisitionForm
                isEditing={false}
                onClose={() => setOpen(false)}
              />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}
