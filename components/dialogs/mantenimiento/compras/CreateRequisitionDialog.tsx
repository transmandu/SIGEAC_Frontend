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

interface RoleFormRule {
  allow?: Role[]
  default?: boolean
  render: () => React.ReactNode
}

function renderByRules(
  userRoles: Role[],
  rules: RoleFormRule[]
) {
  const matchedRule = rules.find(rule =>
    rule.allow?.some(role => userRoles.includes(role))
  )

  if (matchedRule) {
    return matchedRule.render()
  }

  const defaultRule = rules.find(rule => rule.default)

  return defaultRule?.render() ?? null
}

export function CreateRequisitionDialog() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  const userRoles = user?.roles?.map(role => role.name) || []

  /* ==================== Reglas Batch / Lote ==================== */
  const batchRequisitionRules: RoleFormRule[] = [
    {
      allow: ["ENGINEERING"],
      render: () => (
        <CreateEngineeringBatchRequisitionForm
          onClose={() => setOpen(false)}
        />
      ),
    },
    {
      default: true,
      render: () => (
        <CreateGeneralBatchRequisitionForm
          isEditing={false}
          onClose={() => setOpen(false)}
        />
      ),
    },
  ]

  /* ==================== Reglas Artículo ==================== */
  const articleRequisitionRules: RoleFormRule[] = [
    {
      // Por ahora cualquier rol cae aquí
      default: true,
      render: () => (
        <CreateGeneralArticleRequisitionForm
          isEditing={false}
          onClose={() => setOpen(false)}
        />
      ),
    },
  ]

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

        <Tabs defaultValue="articulo" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="batch">
              Lote
            </TabsTrigger>
            <TabsTrigger value="articulo">
              Artículo
            </TabsTrigger>
          </TabsList>
          {/* ================= TAB LOTE ================= */}
          <TabsContent value="batch" className="mt-4">
            {renderByRules(userRoles, batchRequisitionRules)}
          </TabsContent>

          {/* ================= TAB ARTÍCULO ================= */}
          <TabsContent value="articulo" className="mt-4">
            {renderByRules(userRoles, articleRequisitionRules)}
          </TabsContent>

        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
