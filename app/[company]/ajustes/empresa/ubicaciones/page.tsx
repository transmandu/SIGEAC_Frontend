'use client'

import { ContentLayout } from '@/components/layout/ContentLayout'
import { useGetLocationsByCompany } from '@/hooks/sistema/useGetLocationsByCompany'
import { useCompanyStore } from '@/stores/CompanyStore'

import LoadingPage from '@/components/misc/LoadingPage'

import { columns } from './columns'
import { DataTable } from './data-table'

const LocationsPage = () => {
  const { selectedCompany } = useCompanyStore()

  const companySlug = selectedCompany?.slug

  const {
    data: locations,
    isPending: isLoading,
    isError: error,
  } = useGetLocationsByCompany(companySlug)

  const loading = !companySlug || isLoading

  if (loading) return <LoadingPage />

  return (
    <ContentLayout title='Ubicaciones'>
      <div className='flex flex-col gap-y-2'>

        <div className='flex items-baseline justify-between'>
          <h1 className='text-2xl font-bold'>
            Control de Ubicaciones
          </h1>
        </div>

        <p className='text-xs text-muted-foreground'>
          Aquí se lleva el control de las diferentes ubicaciones registradas en el sistema.
        </p>

        {error && (
          <p className='text-sm text-muted-foreground italic'>
            Ha ocurrido un error al cargar las ubicaciones...
          </p>
        )}

        {locations && (
          <DataTable
            columns={columns}
            data={locations}
          />
        )}

      </div>
    </ContentLayout>
  )
}

export default LocationsPage