'use client'

import { ContentLayout } from '@/components/layout/ContentLayout';
import { useGetWarehouses } from '@/hooks/administracion/useGetWarehouses';
import { Loader2 } from 'lucide-react';
import { columns } from './columns';
import { DataTable } from './data-table';

const AlmacenesPage = () => {
  const { data: warehouses, isLoading, error } = useGetWarehouses();
  return (
    <ContentLayout title={'Almacenes'}>
      <h1 className='text-4xl font-bold text-center mb-2'>Control de Almácenes</h1>
      <p className='text-sm text-muted-foreground text-center'>
        Aquí puede observar todos los almacénes registrados. Filtre y/o busque sí desea un item en específico. <br /> Presione el boton de <strong>Crear</strong> en caso de querer crear un nuevo almácen.
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
            <p className='text-sm text-muted-foreground'>Ha ocurrido un error al cargar los almacenes...</p>
          </div>
        )
      }
      {
        warehouses && (
          <DataTable columns={columns} data={warehouses} />
        )
      }
    </ContentLayout>
  )
}

export default AlmacenesPage
