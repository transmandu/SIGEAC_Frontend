'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

import {
  Boxes,
  Package,
  Plane,
  FilePlus2,
} from 'lucide-react'

import { CreateAeronauticalRequisitionForm } from '@/components/forms/mantenimiento/compras/CreateAeronauticalRequisitionForm'
import { CreateWarehouseRequisitionForm } from '@/components/forms/mantenimiento/compras/CreateWarehouseRequisitionForm'
import { CreateGeneralRequisitionForm } from '@/components/forms/mantenimiento/compras/CreateGeneralRequisitionForm'

export function CreateRequisitionDialog() {
  const [open, setOpen] = useState(false)

  const [hovered, setHovered] = useState(false)
  const [pos, setPos] = useState({ x: 50, y: 50 })

  const handleMouseMove = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (!hovered) return

    const rect = e.currentTarget.getBoundingClientRect()

    const x =
      ((e.clientX - rect.left) / rect.width) * 100

    const y =
      ((e.clientY - rect.top) / rect.height) * 100

    setPos({ x, y })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* ===================== TRIGGER ===================== */}
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
              : 'none',
          }}
        >
          Nueva solicitud
        </Button>
      </DialogTrigger>

      {/* ===================== DIALOG ===================== */}
      <DialogContent
        className="
          w-[95vw]
          max-w-[95vw]
          sm:max-w-[860px]
          p-0
          overflow-hidden
          max-h-[85vh]
          flex
          flex-col
        "
      >
        {/* ===================== HEADER ===================== */}
        <div
          className="
            shrink-0
            relative
            bg-gradient-to-br
            from-primary/5
            via-background
            to-background
            px-4
            sm:px-6
            pt-6
            sm:pt-8
            pb-1
          "
        >
          <div className="absolute inset-0 bg-grid-white/[0.02]" />

          <DialogHeader className="relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div
                className="
                  flex h-12 w-12
                  sm:h-14 sm:w-14
                  shrink-0
                  items-center
                  justify-center
                  rounded-3xl
                  border
                  bg-background
                  shadow-sm
                "
              >
                <FilePlus2 className="h-6 w-6 sm:h-7 sm:w-7 text-teal-600 dark:text-teal-400" />
              </div>

              <div className="space-y-1">
                <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight leading-none">
                  Centro de solicitudes
                </DialogTitle>

                <p className="text-sm font-medium text-teal-700 dark:text-teal-300">
                  Compras y abastecimiento
                </p>

                <DialogDescription className="max-w-[430px] text-sm leading-relaxed">
                  Cree solicitudes de compra según el tipo de operación.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* ===================== BODY ===================== */}
        <div className="overflow-y-auto px-4 sm:px-6 py-5">
          <Tabs defaultValue="AERONAUTICAL">
            {/* ===================== TABS ===================== */}
            <TabsList
              className="
                grid
                grid-cols-1
                sm:grid-cols-3
                gap-1
                sm:gap-0
                h-auto
                mb-4
              "
            >
              <TabsTrigger
                value="AERONAUTICAL"
                className="
                  flex items-center gap-2
                  justify-start sm:justify-center
                  text-xs sm:text-sm
                  rounded-lg
                  transition-all duration-200

                  data-[state=active]:bg-background
                  data-[state=active]:shadow-md
                  data-[state=active]:shadow-teal-500/10
                  data-[state=active]:ring-1
                  data-[state=active]:ring-teal-500/20
                  data-[state=active]:text-teal-600
                "
              >
                <Plane className="size-4" />
                Aeronáutica
              </TabsTrigger>

              <TabsTrigger
                value="WAREHOUSE"
                className="
                  flex items-center gap-2
                  justify-start sm:justify-center
                  text-xs sm:text-sm
                  rounded-lg
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
                Almacén
              </TabsTrigger>

              <TabsTrigger
                value="GENERAL"
                className="
                  flex items-center gap-2
                  justify-start sm:justify-center
                  text-xs sm:text-sm
                  rounded-lg
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
                General
              </TabsTrigger>
            </TabsList>

            {/* ===================== CONTENT ===================== */}

            <TabsContent value="AERONAUTICAL" className="mt-4">
              <CreateAeronauticalRequisitionForm
                onClose={() => setOpen(false)}
              />
            </TabsContent>

            <TabsContent value="WAREHOUSE" className="mt-4">
              <CreateWarehouseRequisitionForm
                onClose={() => setOpen(false)}
              />
            </TabsContent>

            <TabsContent value="GENERAL" className="mt-4">
              <CreateGeneralRequisitionForm
                isEditing={false}
                onClose={() => setOpen(false)}
              />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}