'use client'

import { useMemo, useState, useDeferredValue } from 'react'
import { ContentLayout } from '@/components/layout/ContentLayout'
import LoadingPage from '@/components/misc/LoadingPage'
import BackButton from '@/components/misc/BackButton'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useCompanyStore } from '@/stores/CompanyStore'
import { useGetAuthorizedEmployeesFromCompany } from '@/hooks/sistema/autorizados/useGetAuthorizedEmployeesFromCompany'
import { columns } from './columns'
import { DataTable } from './data-table'

const AuthorizeEmployeesPage = () => {
  const { selectedCompany } = useCompanyStore()
  const { data: authorizedEmployees, isLoading, isError } = useGetAuthorizedEmployeesFromCompany(selectedCompany?.slug)
  const [search, setSearch] = useState('')

  const deferredSearch = useDeferredValue(search)

  const isInitialLoading = isLoading && !authorizedEmployees
  const isUpdating = isLoading && !!authorizedEmployees

  const filteredEmployees = useMemo(() => {
    if (!authorizedEmployees) return []

    const q = deferredSearch.toLowerCase()

    return authorizedEmployees.filter((employee) => {
      const matchesSearch =
        !deferredSearch.trim() ||
        employee.employee_name?.toLowerCase()?.includes(q) ||
        employee.dni_employee?.toLowerCase()?.includes(q) ||
        employee.to_company_db?.toLowerCase()?.includes(q)

      return matchesSearch
    })
  }, [authorizedEmployees, deferredSearch])

  return (
    <ContentLayout title="Autorizar Empleados">
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
                  Autorizar Empleados
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex flex-col gap-2 border-b pb-4">
          <h1 className="text-3xl font-semibold tracking-tight">
            Gestión de Autorizaciones
          </h1>

          <p className="text-sm text-muted-foreground">
            Visualice los empleados que su empresa ha autorizado para operar en otras empresas
            y registre o revoque autorizaciones cuando sea necesario.
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 px-3 py-2 rounded-xl border bg-slate-200/40 border-slate-200/40 dark:bg-slate-800/70 dark:border-slate-700/60 backdrop-blur-md dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)]">

          <div className="relative w-64 sm:w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />

            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar autorizaciones..."
              className="
                pl-8 h-8 text-xs
                bg-white/80 dark:bg-slate-900/60
                border-slate-200/60
                dark:border-slate-700/60
                focus-visible:ring-1
                focus-visible:ring-[#439A97]/40
              "
            />
          </div>

          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {filteredEmployees.length}{' '}
            {filteredEmployees.length === 1 ? 'autorización' : 'autorizaciones'}
          </span>
        </div>

        {isInitialLoading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <LoadingPage />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredEmployees}
            loading={isUpdating}
          />
        )}

        {isError && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
            <p className="text-sm text-red-500">
              Ha ocurrido un error al cargar las autorizaciones de empleados.
            </p>
          </div>
        )}

      </div>
    </ContentLayout>
  )
}

export default AuthorizeEmployeesPage
