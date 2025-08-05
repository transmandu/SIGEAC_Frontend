'use client';

import { ContentLayout } from '@/components/layout/ContentLayout';
import { useGetArticlesByBatch } from '@/hooks/mantenimiento/almacen/articulos/useGetArticlesByBatch';
import { useCompanyStore } from '@/stores/CompanyStore';
import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { columns } from './columns';
import { DataTable } from './data-table';

const BatchDetailPage = () => {

  const { slug } = useParams<{ slug: string }>()

  const { selectedStation, selectedCompany } = useCompanyStore();

  const { mutate, data: batch, isPending: isBatchesLoading, isError } = useGetArticlesByBatch(Number(selectedStation), slug, selectedCompany?.slug);

  useEffect(() => {
    if (selectedStation) {
      mutate(Number(selectedStation))
    }
  }, [selectedStation, mutate])
  return (
    <ContentLayout title='Inventario'>
      <div className='flex flex-col gap-y-2'>
        <h1 className='text-4xl font-bold text-center'>Detalles del Renglón</h1>
        <h3 className='text-3xl font-bold italic text-center'>{batch?.name}</h3>
        <p className='text-sm text-muted-foreground text-center italic mt-2'>
          Aquí puede observar todos los renglones de los diferentes almacenes. Filtre y/o busque sí desea un renglón en específico.
        </p>
        {
          isBatchesLoading && (
            <div className='flex w-full h-full justify-center items-center'>
              <Loader2 className='size-24 animate-spin mt-48' />
            </div>
          )
        }
        {
          batch && (
            <>
              <DataTable columns={columns} data={batch!.articles} />
            </>
          )
        }
        {
          isError && <p className='text-sm text-muted-foreground text-center'>Ha ocurrido un error al cargar los articulos...</p>
        }
      </div>
    </ContentLayout>
  )
}

export default BatchDetailPage
