'use client'

import { ContentLayout } from '@/components/layout/ContentLayout';
import { Loader2 } from 'lucide-react';
import { columns } from './columns';
import { DataTable } from './data-table';
import { useGetClients } from '@/hooks/general/clientes/useGetClients';
import { useCompanyStore } from '@/stores/CompanyStore';

const BanksPage = () => {
  const {selectedCompany} = useCompanyStore();
  const { data: clients, isLoading, error } = useGetClients(selectedCompany?.slug);
  return (
    <ContentLayout title={'Almacenes'}>
      <h1 className='text-4xl font-bold text-center mb-2'>Control de Clientes</h1>
      <p className='text-sm text-muted-foreground text-center'>
        Lleve un control de los diferentes clientes que se han registrado.
      </p>
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
            <p className='text-sm text-muted-foreground'>Ha ocurrido un error al cargar los clientes...</p>
          </div>
        )
      }
      {
        clients && (
          <DataTable columns={columns} data={clients} />
        )
      }
    </ContentLayout>
  )
}

export default BanksPage
