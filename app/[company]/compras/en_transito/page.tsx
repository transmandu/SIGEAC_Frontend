'use client'

import { useState, useDeferredValue, useMemo } from 'react'

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
import { DataTable } from './data-table'
import { getColumns } from './columns'
import TransitToolbar from './_components/TransitToolBar'
import { useTransitArticles } from './hooks/useTransitArticles'
import type { TransitStatusFilter } from './types'
import TransitSubRow from './_components/TransitSubRow'

const EnTransitoPage = () => {
  const { selectedCompany } = useCompanyStore()
  const [search, setSearch] = useState('')
  const [status, setStatus] =
    useState<TransitStatusFilter>('ALL')
  const deferredSearch = useDeferredValue(search)
  const {
    articles,
    totalTransit,
    totalReception,
    isLoading,
    isError,
  } = useTransitArticles({ status })
  const filteredArticles = useMemo(() => {
    if (!deferredSearch.trim()) return articles

    const q = deferredSearch.toLowerCase()

    return articles.filter((a) =>
      a.part_number?.toLowerCase().includes(q) ||
      a.alternative_part_number?.toLowerCase().includes(q) ||
      a.batch?.name?.toLowerCase().includes(q) ||
      a.batch?.warehouse?.location?.address
        ?.toLowerCase()
        .includes(q)
    )
  }, [articles, deferredSearch])

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

  if (isError) {
    return (
      <ContentLayout title="Artículos en Tránsito">
        <div className="flex items-center justify-center min-h-[300px] text-sm text-red-500">
          Error cargando artículos en tránsito
        </div>
      </ContentLayout>
    )
  }

  return (
    <ContentLayout title="Artículos en Tránsito">
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
                  Artículos en Tránsito
                </BreadcrumbPage>
              </BreadcrumbItem>

            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex flex-col gap-2 border-b pb-4">
          <h1 className="text-3xl font-semibold tracking-tight">
            Artículos en Tránsito
          </h1>

          <p className="text-sm text-muted-foreground">
            Gestiona artículos en proceso de tránsito y recepción dentro del sistema logístico.
          </p>
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
          <TransitToolbar
            search={search}
            setSearch={setSearch}
            status={status}
            setStatus={setStatus}
          />

          <span className="text-xs text-muted-foreground tabular-nums">
            {filteredArticles.length}{' '}
            {filteredArticles.length === 1 ? 'artículo' : 'artículos'}
          </span>
        </div>

        <DataTable
          columns={columns}
          data={filteredArticles}
          // renderSubRow={(row) => (
          //   <TransitSubRow row={row} />
          // )}
        />

      </div>
    </ContentLayout>
  )
}

export default EnTransitoPage