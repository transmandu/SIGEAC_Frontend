'use client'

import { useMemo, useState, useDeferredValue } from 'react'
import { ContentLayout } from '@/components/layout/ContentLayout'
import BackButton from '@/components/misc/BackButton'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useCompanyStore } from '@/stores/CompanyStore'
import { useGetPurchaseOrders } from '@/hooks/mantenimiento/compras/useGetPurchaseOrders'
import type { PurchaseOrder } from '@/types/purchase'
import { isAeronauticalPurchaseOrder } from '@/lib/purchases/purchase-order-scope'
import { DataTable } from '../../data-table'
import { getColumns } from './columns'
import PurchaseOrderToolBar from './_components/PurchaseOrderToolBar'
import GroupedPurchaseOrderTable from './_components/GroupedPurchaseOrderTable'
import PurchaseOrderSplitView, { usePurchaseOrderPreview, usePurchaseOrderPreviewSelectedId } from '@/components/side-panels/PurchaseOrderSplitView'

const PurchaseOrdersPage = () => {
  return (
    <PurchaseOrderSplitView>
      <PurchaseOrdersPageContent />
    </PurchaseOrderSplitView>
  )
}

const PurchaseOrdersPageContent = () => {
  const { selectedCompany, selectedStation } = useCompanyStore()
  const onPreview = usePurchaseOrderPreview()
  const selectedPreviewId = usePurchaseOrderPreviewSelectedId()

  const {
    data: po,
    isLoading,
    isError,
  } = useGetPurchaseOrders(
    selectedCompany?.slug ?? '',
    selectedStation ?? ''
  )

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('ALL')
  const [groupBy, setGroupBy] = useState('NONE')

  const deferredSearch = useDeferredValue(search)

  const filteredPO = useMemo(() => {
    if (!po) return []

    const q = deferredSearch.toLowerCase()

    return po.filter((item: PurchaseOrder) => {
      // Compras generales no se gestionan en este módulo: las órdenes con
      // sufijo -G no aplican aquí.
      const isAeronauticalScope = isAeronauticalPurchaseOrder(item)

      const matchesStatus =
        status === 'ALL' || item.status === status

      const matchesSearch =
        !q ||
        item.order_number?.toLowerCase?.().includes(q) ||
        item.vendor?.name?.toLowerCase?.().includes(q)

      return isAeronauticalScope && matchesStatus && matchesSearch
    })
  }, [po, deferredSearch, status])

  const columns = useMemo(
    () => getColumns(selectedCompany ?? undefined, onPreview ?? undefined, selectedPreviewId),
    [selectedCompany, onPreview, selectedPreviewId]
  )

  return (
    <ContentLayout title="Órdenes de Compra">
      <div className="flex flex-col gap-6">

        <div className="flex items-center gap-3">
          <BackButton iconOnly tooltip="Volver" variant="secondary" />

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/${selectedCompany?.slug}/dashboard`}>
                  Inicio
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbSeparator />

              <BreadcrumbItem>
                Compras
              </BreadcrumbItem>

              <BreadcrumbSeparator />

              <BreadcrumbItem>
                <BreadcrumbPage>
                  Órdenes de Compra
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex flex-col gap-2 border-b pb-4">
          <h1 className="text-3xl font-semibold tracking-tight">
            Órdenes de Compra
          </h1>

          <p className="text-sm text-muted-foreground">
            Gestiona y visualiza las órdenes generadas en el sistema de compras.
          </p>
        </div>

        <div className="
          flex items-center justify-between gap-4
          px-3 py-2
          rounded-xl border
          bg-slate-200/40 border-slate-200/40
          dark:bg-slate-800/70 dark:border-slate-700/60
          backdrop-blur-md
        ">
          <PurchaseOrderToolBar
            search={search}
            setSearch={setSearch}
            status={status}
            setStatus={setStatus}
            groupBy={groupBy}
            setGroupBy={setGroupBy}
          />

          <span className="text-xs text-muted-foreground tabular-nums">
            {filteredPO.length}{' '}
            {filteredPO.length === 1 ? 'orden' : 'órdenes'}
          </span>
        </div>

        {groupBy === 'quote' || groupBy === 'vendor' ? (
          <GroupedPurchaseOrderTable
            data={filteredPO}
            groupBy={groupBy}
            renderTable={(rows) => (
              <DataTable
                columns={columns}
                data={rows}
                loading={isLoading}
                emptyText="No se ha encontrado ningún resultado..."
                overflowVisible
                persistKey="ordenes_compra"
              />
            )}
          />
        ) : (
          <DataTable
            columns={columns}
            data={filteredPO}
            loading={isLoading}
            emptyText="No se ha encontrado ningún resultado..."
            persistKey="ordenes_compra"
          />
        )}

        {/* ERROR */}
        {isError && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
            <p className="text-sm text-red-500">
              Error cargando órdenes de compra.
            </p>
          </div>
        )}

      </div>
    </ContentLayout>
  )
}

export default PurchaseOrdersPage