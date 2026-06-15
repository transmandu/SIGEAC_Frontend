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
import { useAuth } from '@/contexts/AuthContext'
import { CreateAeronauticalRequisitionForm } from '@/components/forms/mantenimiento/compras/CreateAeronauticalRequisitionForm'
import { CreateStockRequisitionForm } from '@/components/forms/mantenimiento/compras/CreateStockRequisitionForm'
import { CreateGeneralRequisitionForm } from '@/components/forms/mantenimiento/compras/CreateGeneralRequisitionForm'

type Role = string

export function CreateRequisitionDialog() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  const userRoles: Role[] = user?.roles?.map(role => role.name) || []

  const hasRole = (...roles: string[]) =>
    roles.some(role => userRoles.includes(role))

  const isWarehouseUser = hasRole(
    'JEFE_ALMACEN',
    'ANALISTA_ALMACEN'
  )

  const isMaintenanceUser = hasRole(
    'ANALISTA_PLANIFICACION',
    'JEFE_PLANIFICACION',
    'JEFE_MANTENIMIENTO',
    'ENGINEERING'
  )

  const isPurchasingUser = hasRole(
    'SUPERUSER',
    'ANALISTA_COMPRAS',
    'JEFE_COMPRAS'
  )

  const showStock = isWarehouseUser || isPurchasingUser
  const showAeronautical = isMaintenanceUser || isPurchasingUser
  const showGeneral = !isWarehouseUser || isPurchasingUser

  const tabs = [
    showAeronautical && {
      value: 'AERONAUTICAL',
      label: 'Aeronáutica',
    },
    showStock && {
      value: 'STOCK',
      label: 'Inventario',
    },
    showGeneral && {
      value: 'GENERAL',
      label: 'General',
    },
  ].filter(Boolean) as { value: string; label: string }[]

  const defaultTab = tabs[0]?.value

  const tabsGridClass =
    tabs.length === 3
      ? 'grid-cols-1 sm:grid-cols-3'
      : tabs.length === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : 'grid-cols-1'

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

      <DialogContent
        className="
          w-[95vw]
          max-w-[95vw]
          sm:max-w-[860px]
          max-h-[85vh]
          p-0
          overflow-hidden
          flex
          flex-col
        "
      >
        <DialogHeader className="space-y-2 px-6 pt-6 shrink-0">
          <DialogTitle className="text-lg sm:text-xl">
            Creación de Solicitud de Compra
          </DialogTitle>

          <DialogDescription>
            {tabs.length === 1 && showStock
              ? 'Cree una solicitud para reponer artículos de inventario y stock de almacén'
              : 'Seleccione el tipo de solicitud que desea crear'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto px-6 pb-6">
          {/* ================= SINGLE FORM ================= */}
          {tabs.length === 1 && (
            <>
              {showStock && (
                <CreateStockRequisitionForm
                  onClose={() => setOpen(false)}
                />
              )}

              {!showStock && showAeronautical && (
                <CreateAeronauticalRequisitionForm
                  onClose={() => setOpen(false)}
                />
              )}

              {!showStock &&
                !showAeronautical &&
                showGeneral && (
                  <CreateGeneralRequisitionForm
                    isEditing={false}
                    onClose={() => setOpen(false)}
                  />
                )}
            </>
          )}

          {/* ================= MULTIPLE TABS ================= */}
          {tabs.length > 1 && (
            <Tabs
              defaultValue={defaultTab}
              className="w-full overflow-hidden"
            >
              <TabsList
                className={`
                  grid
                  w-full
                  gap-2
                  h-auto
                  ${tabsGridClass}
                `}
              >
                {tabs.map(tab => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="
                      justify-start
                      sm:justify-center
                    "
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {showAeronautical && (
                <TabsContent
                  value="AERONAUTICAL"
                  className="mt-4"
                >
                  <CreateAeronauticalRequisitionForm
                    onClose={() => setOpen(false)}
                  />
                </TabsContent>
              )}

              {showStock && (
                <TabsContent value="STOCK" className="mt-4">
                  <CreateStockRequisitionForm
                    onClose={() => setOpen(false)}
                  />
                </TabsContent>
              )}

              {showGeneral && (
                <TabsContent
                  value="GENERAL"
                  className="mt-4"
                >
                  <CreateGeneralRequisitionForm
                    isEditing={false}
                    onClose={() => setOpen(false)}
                  />
                </TabsContent>
              )}
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}