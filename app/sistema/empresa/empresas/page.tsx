'use client'

import { useMemo, useState, useDeferredValue } from 'react'
import { ContentLayout } from '@/components/layout/ContentLayout'
import LoadingPage from '@/components/misc/LoadingPage'
import BackButton from '@/components/misc/BackButton'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { useCompanyStore } from '@/stores/CompanyStore'
import { useGetCompanies } from '@/hooks/sistema/useGetCompanies'
import { getColumns } from './columns'
import { DataTable } from './data-table'
import CompaniesToolBar from './_components/CompaniesToolBar'
import CompaniesSubRow from './_components/CompaniesSubRow'

const CompaniesPage = () => {
  const { selectedCompany } = useCompanyStore()
  const { data: companies, isLoading, isError } = useGetCompanies()
  const [search, setSearch] = useState('')

  const deferredSearch = useDeferredValue(search)

  const isInitialLoading = isLoading && !companies
  const isUpdating = isLoading && !!companies

  const filteredCompanies = useMemo(() => {
    if (!companies) return []

    const q = deferredSearch.toLowerCase()

    return companies.filter((company: any) => {
      const matchesSearch =
        !deferredSearch.trim() ||
        company.name?.toLowerCase()?.includes(q) ||
        company.slug?.toLowerCase()?.includes(q) ||
        company.rif?.toLowerCase()?.includes(q) ||
        company.acronym?.toLowerCase()?.includes(q)

      return matchesSearch
    })
  }, [companies, deferredSearch])

  const columns = useMemo(() => getColumns(), [])

  return (
    <ContentLayout title="Empresas">
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
                Sistemas
              </BreadcrumbItem>

              <BreadcrumbSeparator />

              <BreadcrumbItem>
                <BreadcrumbPage>
                  Empresas
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex flex-col gap-2 border-b pb-4">
          <h1 className="text-3xl font-semibold tracking-tight">
            Gestión de Empresas
          </h1>

          <p className="text-sm text-muted-foreground">
            Administra las compañías del sistema, sus módulos y configuración global.
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 px-3 py-2 rounded-xl border bg-slate-200/40 border-slate-200/40 dark:bg-slate-800/70 dark:border-slate-700/60 backdrop-blur-md dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)]">

          <CompaniesToolBar
            search={search}
            setSearch={setSearch}
          />

          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {filteredCompanies.length}{' '}
            {filteredCompanies.length === 1 ? 'empresa' : 'empresas'}
          </span>
        </div>

        {isInitialLoading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <LoadingPage />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredCompanies}
            loading={isUpdating}
            canExpandRow={() => true}
            renderSubRow={(row) => (
              <CompaniesSubRow company={row.original} />
            )}
          />
        )}

        {isError && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
            <p className="text-sm text-red-500">
              Ha ocurrido un error al cargar las empresas.
            </p>
          </div>
        )}

      </div>
    </ContentLayout>
  )
}

export default CompaniesPage