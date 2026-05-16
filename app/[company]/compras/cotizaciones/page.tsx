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

import { useGetQuotes } from '@/hooks/mantenimiento/compras/useGetQuotes'
import { useCompanyStore } from '@/stores/CompanyStore'

import { getColumns } from './columns'
import { DataTable } from './data-table'

import QuotesToolBar from './_components/QuotesToolBar'
import GroupedQuotesTable from './_components/GroupedQuotesTable'

const QuotesOrdersPage = () => {
  const { selectedCompany, selectedStation } = useCompanyStore()

  const {
    data: quotes,
    isLoading,
    isError,
  } = useGetQuotes(
    selectedCompany?.slug ?? null,
    selectedStation ?? null
  )

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('ALL')
  const [groupBy, setGroupBy] = useState<string>('NONE')

  const deferredSearch = useDeferredValue(search)

  const filteredQuotes = useMemo(() => {
    if (!quotes) return []

    let filtered = [...quotes]

    if (status !== 'ALL') {
      filtered = filtered.filter(
        (quote: any) => quote.status === status
      )
    }

    if (!deferredSearch.trim()) {
      return filtered
    }

    const q = deferredSearch.toLowerCase()

    return filtered.filter((quote: any) => {
      return (
        quote.quote_number?.toLowerCase?.().includes(q) ||

        quote.requisition_order?.order_number
          ?.toLowerCase?.()
          .includes(q) ||

        quote.created_by?.username
          ?.toLowerCase?.()
          .includes(q) ||

        quote.quote_date
          ?.toLowerCase?.()
          .includes(q) ||

        quote.vendor?.name
          ?.toLowerCase?.()
          .includes(q) ||

        quote.justification
          ?.toLowerCase?.()
          .includes(q)
      )
    })
  }, [quotes, deferredSearch, status])

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
    <ContentLayout title="Cotizaciones de Compra">
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
                  Cotizaciones de Compra
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex flex-col gap-2 border-b pb-4">
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <h1 className="text-3xl font-semibold tracking-tight">
                Cotizaciones de Compra
              </h1>

              <p className="text-sm text-muted-foreground">
                Visualiza y gestiona las cotizaciones generadas dentro del sistema de compras.
              </p>
            </div>
          </div>
        </div>

        <div
          className="
            flex items-center justify-between gap-4
            px-3 py-2
            rounded-xl border
            bg-slate-200/40 border-slate-200/40
            dark:bg-slate-800/70 dark:border-slate-700/60
            backdrop-blur-md
            dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)]
          "
        >
          <QuotesToolBar
            search={search}
            setSearch={setSearch}
            status={status}
            setStatus={setStatus}
            groupBy={groupBy}
            setGroupBy={setGroupBy}
          />

          <span
            className="
              shrink-0
              text-xs
              text-muted-foreground
              tabular-nums
            "
          >
            {filteredQuotes.length} {filteredQuotes.length === 1 ? 'cotización' : 'cotizaciones'}
          </span>
        </div>

        {groupBy !== 'NONE' ? (
          <GroupedQuotesTable
            data={filteredQuotes}
            groupBy={groupBy as any}
            renderTable={(rows) => (
              <DataTable
                columns={columns}
                data={rows}
              />
            )}
          />
        ) : (
          <DataTable
            columns={columns}
            data={filteredQuotes}
          />
        )}

        {isError && (
          <div
            className="
              rounded-lg border border-red-500/20
              bg-red-500/5
              px-4 py-3
            "
          >
            <p className="text-sm text-red-500">
              Ha ocurrido un error al cargar las cotizaciones.
            </p>
          </div>
        )}

      </div>
    </ContentLayout>
  )
}

export default QuotesOrdersPage