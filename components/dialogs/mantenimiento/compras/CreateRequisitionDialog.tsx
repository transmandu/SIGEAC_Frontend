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

import { Boxes, Package } from "lucide-react"

import { useAuth } from "@/contexts/AuthContext"

import { CreateEngineeringBatchRequisitionForm } from "@/components/forms/mantenimiento/compras/CreateEngineeringBatchRequisitionForm"
import { CreateGeneralBatchRequisitionForm } from "@/components/forms/mantenimiento/compras/CreateGeneralBatchRequisitionForm"
import { CreateGeneralArticleRequisitionForm } from "@/components/forms/mantenimiento/compras/CreateGeneralArticleRequisitionForm"

import { FilePlus2 } from "lucide-react"

type Role = string

export function CreateRequisitionDialog() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  const [hovered, setHovered] = useState(false)
  const [pos, setPos] = useState({ x: 50, y: 50 })

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!hovered) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setPos({ x, y })
  }

  const userRoles: Role[] = user?.roles?.map(role => role.name) || []
  const isEngineering = userRoles.includes("ENGINEERING")

  return (
    <Dialog open={open} onOpenChange={setOpen}>

      {/* ===================== TRIGGER (igual DispatchReportDialog) ===================== */}
      <DialogTrigger asChild>
        <Button
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onMouseMove={handleMouseMove}
          variant="outline"
          className="
            relative overflow-hidden
            h-10 px-4
            border border-dashed
            border-teal-400/50 dark:border-teal-300/30
            bg-background/70 backdrop-blur
            text-teal-700 dark:text-teal-300
            font-medium tracking-wide
            shadow-sm transition-all duration-200
            hover:border-teal-500/60 dark:hover:border-teal-300/50
            hover:bg-teal-50/40 dark:hover:bg-teal-950/20
            hover:shadow-md hover:-translate-y-[1px]
            active:translate-y-0 active:shadow-sm
            focus-visible:ring-2 focus-visible:ring-teal-500/25
          "
          style={{
            backgroundImage: hovered
              ? `radial-gradient(circle at ${pos.x}% ${pos.y}%, rgba(20,184,166,0.10), transparent 65%)`
              : 'none'
          }}
        >
          Nueva solicitud
        </Button>
      </DialogTrigger>

      {/* ===================== DIALOG ===================== */}
      <DialogContent className="sm:max-w-[680px] p-0 overflow-visible">

        {/* ===================== HEADER (idéntico patrón DispatchReport) ===================== */}
        <div className="relative bg-gradient-to-br from-primary/5 via-background to-background px-6 pt-8 pb-1">

          <div className="absolute inset-0 bg-grid-white/[0.02]" />

          <DialogHeader className="relative">
            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl border bg-background shadow-sm">
                <FilePlus2 className="h-7 w-7 text-teal-600 dark:text-teal-400" />
              </div>

              <div className="space-y-1">
                <DialogTitle className="text-2xl font-bold tracking-tight leading-none">
                  Centro de requisiciones
                </DialogTitle>

                <p className="text-sm font-medium text-teal-700 dark:text-teal-300">
                  Compras y abastecimiento
                </p>

                <DialogDescription className="max-w-[430px] text-sm leading-relaxed">
                  Cree solicitudes de compra por lote o artículo según el tipo de operación.
                </DialogDescription>
              </div>

            </div>
          </DialogHeader>
        </div>

        {/* ===================== BODY ===================== */}
        <div className="px-6 py-5">

          {isEngineering ? (
            <CreateEngineeringBatchRequisitionForm onClose={() => setOpen(false)} />
          ) : (
            <Tabs defaultValue="batch">

              {/* ===================== TABS (idéntico DispatchReport) ===================== */}
              <TabsList className="grid grid-cols-2 mb-4">

                <TabsTrigger
                  value="batch"
                  className="
                    flex items-center gap-2 text-xs rounded-lg
                    transition-all duration-200

                    data-[state=active]:bg-background
                    data-[state=active]:shadow-md
                    data-[state=active]:shadow-teal-500/10
                    data-[state=active]:ring-1
                    data-[state=active]:ring-teal-500/20
                    data-[state=active]:text-teal-600
                  "
                >
                  <Boxes className="size-4" />
                  Lote
                </TabsTrigger>

                <TabsTrigger
                  value="articulo"
                  className="
                    flex items-center gap-2 text-xs rounded-lg
                    transition-all duration-200

                    data-[state=active]:bg-background
                    data-[state=active]:shadow-md
                    data-[state=active]:shadow-teal-500/10
                    data-[state=active]:ring-1
                    data-[state=active]:ring-teal-500/20
                    data-[state=active]:text-teal-600
                  "
                >
                  <Package className="size-4" />
                  Artículo
                </TabsTrigger>

              </TabsList>

              {/* ===================== CONTENT ===================== */}
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

        </div>
      </DialogContent>
    </Dialog>
  )
}