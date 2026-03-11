'use client'

import { ContentLayout } from '@/components/layout/ContentLayout'
import { useGetThirdParties } from '@/hooks/general/terceros/useGetThirdParties'
import { useCompanyStore } from '@/stores/CompanyStore'
import { Loader2 } from 'lucide-react'
import { columns } from './columns'
import { DataTable } from './data-table'

const VendorsPage = () => {
  const { selectedCompany } = useCompanyStore();
  const { data: third_parties, isLoading, error } = useGetThirdParties();
  return (
    <ContentLayout title='Permisos'>
      <h1 className='text-5xl font-bold text-center mt-2'>
        Control de Terceros
      </h1>
      <p className='text-sm text-muted-foreground text-center italic mt-2'>Aquí puede llevar el control de los terceros registrados en el sistema.</p>
      {
        isLoading && (
          <div className='grid mt-72 place-content-center'>
            <Loader2 className='w-12 h-12 animate-spin' />
          </div>
        )
      }
      {
        error && (
          <div className='grid mt-72 place-content-center'>
            <p className='text-sm text-muted-foreground'>Ha ocurrido un error al cargar los terceros...</p>
          </div>
        )
      }
      {
        third_parties && (
          <DataTable columns={columns} data={third_parties} />
        )
      }
    </ContentLayout>
  )
}

export default VendorsPage
