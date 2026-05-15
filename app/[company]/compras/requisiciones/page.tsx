'use client'

import { useMemo, useState, useDeferredValue } from 'react'
import { ContentLayout } from '@/components/layout/ContentLayout'
import LoadingPage from '@/components/misc/LoadingPage'
import BackButton from '@/components/misc/BackButton'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { useGetRequisition } from '@/hooks/mantenimiento/compras/useGetRequisitions'
import { useCompanyStore } from '@/stores/CompanyStore'
import { getColumns } from './columns'
import { DataTable } from './data-table'
import { Requisition } from '@/types'
import RequisitionToolBar from './_components/RequisitionToolBar'
import RequisitionSubRow from './_components/RequisitionSubRow'

const RequisitionsPage = () => {

  const { selectedCompany, selectedStation } = useCompanyStore()
  const {
    data: requisitions, isLoading, isError,
  } = useGetRequisition( selectedCompany?.slug, selectedStation || undefined )

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('ALL')
  const [type, setType] = useState('ALL')

  const deferredSearch = useDeferredValue(search)

  const filteredRequisitions = useMemo<Requisition[]>(() => {
    if (!requisitions) return []

    const q = deferredSearch.toLowerCase()
    return requisitions.filter((req: Requisition) => {

      const matchesSearch =
        !deferredSearch.trim() ||
        req.order_number?.toLowerCase?.().includes(q) ||
        req.status?.toLowerCase?.().includes(q) ||
        req.justification?.toLowerCase?.().includes(q) ||
        req.requested_by?.toLowerCase?.().includes(q) ||
        req.type?.toLowerCase?.().includes(q) ||
        req.created_by?.username?.toLowerCase?.().includes(q)

      const matchesStatus =
        status === 'ALL' ||
        req.status === status

      const matchesType =
        type === 'ALL' ||
        req.type === type

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType
      )
    })
  }, [
    requisitions,
    deferredSearch,
    status,
    type,
  ])

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
    <ContentLayout title="Solicitudes de Compra">
      <div className="flex flex-col gap-6">

        <div className="flex items-center gap-3">
          <BackButton
            iconOnly
            tooltip="Volver"
            variant="secondary"
          />

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={`/${selectedCompany?.slug}/dashboard`}
                >
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
                  Solicitudes de Compra
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex flex-col gap-2 border-b pb-4">
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <h1 className="text-3xl font-semibold tracking-tight">
                Solicitudes de Compra
              </h1>
              <p className="text-sm text-muted-foreground">
                Visualiza y gestiona las requisiciones registradas
                dentro del sistema de compras y abastecimiento.
              </p>
            </div>
          </div>
        </div>

        <div className= "flex items-center justify-between gap-4 px-3 py-2 rounded-xl border bg-slate-200/40 border-slate-200/40 dark:bg-slate-800/70 dark:border-slate-700/60 backdrop-blur-md dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)]">

          <RequisitionToolBar
            search={search}
            setSearch={setSearch}
            status={status}
            setStatus={setStatus}
            type={type}
            setType={setType}
          />
          <span
            className=" shrink-0 text-xs text-muted-foreground tabular-nums"
          >
            {filteredRequisitions.length}{' '}
            {filteredRequisitions.length === 1
              ? 'requisición'
              : 'requisiciones'}
          </span>

        </div>

        <DataTable
          columns={columns}
          data={filteredRequisitions}
          renderSubRow={(row) => (
            <RequisitionSubRow
              requisition={row.original}
              selectedCompany={selectedCompany}
            />
          )}
          canExpandRow={(row) => !!row.original.quotes?.length}
        />

        {isError && (
          <div
            className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3"
          >
            <p className="text-sm text-red-500">
              Ha ocurrido un error al cargar las solicitudes de compra.
            </p>
          </div>
        )}

      </div>
    </ContentLayout>
  )
}

export default RequisitionsPage