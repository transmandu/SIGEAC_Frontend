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
import { DataTable } from '../../data-table'
import { getColumns } from './columns'
import IntakeToolBar from './_components/IntakeToolBar'
import { useGetGeneralArticleIntakes } from '@/hooks/mantenimiento/almacen/almacen_general/useGetGeneralArticleIntakes'
import type { GeneralArticleIntakeStatus } from '@/types/purchase'

type StatusFilter = 'ALL' | GeneralArticleIntakeStatus

const RecepcionGeneralPage = () => {
  const { selectedCompany } = useCompanyStore()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('ALL')

  const deferredSearch = useDeferredValue(search)

  const { data: intakes, isLoading, isError } = useGetGeneralArticleIntakes(
    status === 'ALL' ? undefined : status
  )

  const filtered = useMemo(() => {
    if (!intakes) return []

    const q = deferredSearch.trim().toLowerCase()
    if (!q) return intakes

    return intakes.filter(
      (i) =>
        i.description?.toLowerCase().includes(q) ||
        i.brand_model?.toLowerCase().includes(q) ||
        i.purchase_order?.quote_order?.requisition_order?.order_number?.toLowerCase().includes(q) ||
        i.registered_by?.toLowerCase().includes(q)
    )
  }, [intakes, deferredSearch])

  const columns = useMemo(() => getColumns(), [])

  return (
    <ContentLayout title="Recepción General">
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
                  Recepción General
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex flex-col gap-2 border-b pb-4">
          <h1 className="text-3xl font-semibold tracking-tight">
            Recepción General
          </h1>

          <p className="text-sm text-muted-foreground">
            Seguimiento de las entregas físicas de artículos generales registradas por el comprador.
          </p>
        </div>

        <div className="
          flex items-center justify-between gap-4
          px-3 py-2
          rounded-xl border
          bg-slate-200/40 border-slate-200/40
          dark:bg-slate-800/70 dark:border-slate-700/60
          backdrop-blur-md
          dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)]
        ">
          <IntakeToolBar
            search={search}
            setSearch={setSearch}
            status={status}
            setStatus={setStatus}
          />

          <span className="text-xs text-muted-foreground tabular-nums">
            {filtered.length}{' '}
            {filtered.length === 1 ? 'entrada' : 'entradas'}
          </span>
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          loading={isLoading}
          pageSize={15}
          loadingText="Cargando recepciones..."
          emptyText="No se encontraron entradas"
        />

        {isError && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
            <p className="text-sm text-red-500">
              Error cargando recepciones de artículos generales.
            </p>
          </div>
        )}

      </div>
    </ContentLayout>
  )
}

export default RecepcionGeneralPage
