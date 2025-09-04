'use client'

import { ContentLayout } from '@/components/layout/ContentLayout'
import { useGetManufacturers } from '@/hooks/general/fabricantes/useGetManufacturers'
import { Loader2 } from 'lucide-react'
import { columns } from './columns'
import { DataTable } from './data-table'
import { useCompanyStore } from '@/stores/CompanyStore'

const ManufacturersPage = () => {
  const { selectedCompany } = useCompanyStore();
  const { data: manufacturers, isLoading, error } = useGetManufacturers(selectedCompany?.slug);
  return (
    <ContentLayout title='Permisos'>
      <h1 className='text-5xl font-bold text-center mt-2'>
        Control de Fabricantes
      </h1>
      <p className='text-sm text-muted-foreground text-center italic mt-2'>Aquí puede llevar el control de los fabricantes registrados para las diferentes articulos.</p>
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
            <p className='text-sm text-muted-foreground'>Ha ocurrido un error al cargar los proveedores...</p>
          </div>
        )
      }
      {
        manufacturers && (
          <DataTable columns={columns} data={manufacturers} />
        )
      }
    </ContentLayout>
  )
}

export default ManufacturersPage
