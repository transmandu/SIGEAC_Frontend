'use client'

import { useMemo, useState, useDeferredValue } from 'react'
import { ContentLayout } from '@/components/layout/ContentLayout'
import LoadingPage from '@/components/misc/LoadingPage'
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
import { DataTable } from './data-table'
import { getColumns } from './columns'
import PurchaseOrderSubRow from './_components/PurchaseOrderSubRow'
import PurchaseOrderToolBar from './_components/PurchaseOrderToolBar'

const PurchaseOrdersPage = () => {
  const { selectedCompany, selectedStation } = useCompanyStore()
  const { data: po, isLoading, isError } = useGetPurchaseOrders(
    selectedCompany?.slug ?? '',
    selectedStation ?? ''
  )

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('ALL')

  const deferredSearch = useDeferredValue(search)

  const filteredPO = useMemo(() => {
    if (!po) return []

    const q = deferredSearch.toLowerCase()

    return po.filter((item: any) => {
      const matchesStatus =
        status === 'ALL' || item.status === status

      const matchesSearch =
        !q ||
        item.order_number?.toLowerCase?.().includes(q) ||
        item.supplier?.name?.toLowerCase?.().includes(q)

      return matchesStatus && matchesSearch
    })
  }, [po, deferredSearch, status])

  const columns = useMemo(
    () => getColumns(selectedCompany ?? undefined),
    [selectedCompany]
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <LoadingPage />
      </div>
    )
  }

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
              <BreadcrumbItem>Compras</BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Órdenes de Compra</BreadcrumbPage>
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
          />

          <span className="text-xs text-muted-foreground tabular-nums">
            {filteredPO.length}{' '}
            {filteredPO.length === 1 ? 'orden' : 'órdenes'}
          </span>
        </div>

        <DataTable
          columns={columns}
          data={filteredPO}
          renderSubRow={(row) => (
            <PurchaseOrderSubRow row={row} />
          )}
        />

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