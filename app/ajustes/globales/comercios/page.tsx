'use client'

import { ContentLayout } from '@/components/layout/ContentLayout'
import { useGetRetailers } from '@/hooks/general/comercios/useGetRetailers'
import { Loader2 } from 'lucide-react'
import { columns } from './columns'
import { DataTable } from './data-table'
import { useCompanyStore } from '@/stores/CompanyStore'

const RetailersPage = () => {
  const { selectedCompany } = useCompanyStore();
  const { data: retailers, isLoading, error } = useGetRetailers(selectedCompany?.slug);
  return (
    <ContentLayout title='Comercios'>
      <h1 className='text-5xl font-bold text-center mt-2'>
        Control de Comercios
      </h1>
      <p className='text-sm text-muted-foreground text-center italic mt-2'>Aquí puede llevar el control de los comercios y lugares de compra (tiendas físicas o en línea) donde se adquieren los artículos generales.</p>
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
            <p className='text-sm text-muted-foreground'>Ha ocurrido un error al cargar los comercios...</p>
          </div>
        )
      }
      {
        retailers && (
          <DataTable columns={columns} data={retailers} />
        )
      }
    </ContentLayout>
  )
}

export default RetailersPage
