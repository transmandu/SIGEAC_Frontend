'use client';

import { ContentLayout } from '@/components/layout/ContentLayout';
import { useGetInReceptionArticles } from '@/hooks/mantenimiento/almacen/articulos/useGetInReceptionArticles';
import { useCompanyStore } from '@/stores/CompanyStore';
import { Loader2 } from 'lucide-react';
import { columns } from './columns';
import { DataTable } from './data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PageHeader } from "@/components/layout/PageHeader";
const InventarioPage = () => {

  const { selectedStation, selectedCompany } = useCompanyStore();

  const { data: articles, isLoading: isArticlesLoading, isError } = useGetInReceptionArticles(selectedStation ?? null, selectedCompany?.slug);

  return (
    <ContentLayout title='Inventario'>
      <div className='flex flex-col gap-y-2'>
        <PageHeader />
        <h1 className='text-5xl font-bold text-center'>Articulos En Recepción</h1>
        <p className='text-sm text-muted-foreground text-center italic mb-0'>
          Aquí puede observar todos los articulos que se encuentran fuera de almacén. <br />Filtre y/o busque sí desea un articulo en específico.
        </p>
        {
          isArticlesLoading && (
            <div className='flex w-full h-full justify-center items-center'>
              <Loader2 className='size-24 animate-spin mt-48' />
            </div>
          )
        }
        {
          articles && (
            <DataTable columns={columns} data={articles} />

          )
        }
        {
          isError && <p className='text-sm text-muted-foreground'>Ha ocurrido un error al cargar los articulos...</p>
        }
      </div>
    </ContentLayout>
  )
}

export default InventarioPage
