'use client';

import { ContentLayout } from '@/components/layout/ContentLayout';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetBatchesWithArticlesCount } from '@/hooks/mantenimiento/almacen/renglones/useGetBatchesWithArticleCount';
import { useCompanyStore } from '@/stores/CompanyStore';
import { Loader2 } from 'lucide-react';
import { columns } from './columns';
import { DataTable } from './data-table';

const InventarioPage = () => {

  const { selectedCompany, selectedStation } = useCompanyStore();

  const { data: batches, isLoading: isBatchesLoading, isError } = useGetBatchesWithArticlesCount({company: selectedCompany?.slug, location_id: selectedStation ?? undefined});

  return (
    <ContentLayout title='Gestion de Inventario'>
      <div className='flex flex-col gap-y-2'>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${selectedCompany?.slug}/dashboard`}>Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Almacen</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1">
                  <BreadcrumbEllipsis className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem>
                    <BreadcrumbLink href={`/${selectedCompany?.slug}/almacen/inventario/gestion`}>Gestion</BreadcrumbLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <BreadcrumbLink href={`/${selectedCompany?.slug}/almacen/inventario/entregado`}>Entregados</BreadcrumbLink>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbPage>Gestion</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className='text-4xl font-bold text-center'>Inventario de Almacén</h1>
        <p className='text-sm text-muted-foreground text-center  italic'>
          Aquí puede observar todos los lotes de los diferentes almacenes. <br />Filtre y/o busque sí desea un renglón en específico.
        </p>
        {
          isBatchesLoading && (
            <div className='flex w-full h-full justify-center items-center'>
              <Loader2 className='size-24 animate-spin mt-48' />
            </div>
          )
        }
        {
          batches && (
            <DataTable columns={columns} data={batches} />

          )
        }
        {
          isError && <p className='text-sm text-muted-foreground'>Ha ocurrido un error al cargar los lotes...</p>
        }
      </div>
    </ContentLayout>
  )
}

export default InventarioPage
