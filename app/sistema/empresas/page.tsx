'use client'

import { ContentLayout } from '@/components/layout/ContentLayout'
import { useGetCompanies } from '@/hooks/administracion/useGetCompanies'
import { Loader2 } from 'lucide-react'
import { columns } from './columns'
import { DataTable } from './data-table'

const CompanyPage = () => {
  const { data: companies, isLoading, error } = useGetCompanies();
  return (
    <ContentLayout title='Fabricantes'>
      <h1 className='text-5xl font-bold text-center mt-2'>
        Control de Empresas
      </h1>
      <p className='text-sm text-muted-foreground text-center italic mt-2'>Aquí se lleva el control de las diferentes empresas registradas en el sistema.</p>
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
            <p className='text-sm text-muted-foreground'>Ha ocurrido un error al cargar las empresas...</p>
          </div>
        )
      }
      {
        companies && (
          <DataTable columns={columns} data={companies} />
        )
      }
    </ContentLayout>
  )
}

export default CompanyPage
