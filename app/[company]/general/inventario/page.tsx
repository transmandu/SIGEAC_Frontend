'use client';

import { ContentLayout } from '@/components/layout/ContentLayout';
import { useGetBatchesWithArticlesCount } from '@/hooks/mantenimiento/almacen/renglones/useGetBatchesWithArticleCount';
import { useCompanyStore } from '@/stores/CompanyStore';
import { Loader2 } from 'lucide-react';
import { columns } from './columns';
import { DataTable } from './data-table';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useSearchBatchesByPartNumber } from '@/hooks/mantenimiento/almacen/renglones/useGetBatchesByArticlePartNumber';
import { useMemo, useState } from 'react';
import { useDebounce } from '@/hooks/helpers/useDebounce';
import { Input } from '@/components/ui/input';
import SearchSection from './_components/SearchSection';

const InventarioPage = () => {
  const { selectedStation } = useCompanyStore();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Consultas a la API
  const { data: allBatches, isLoading: isLoadingBatches, isError: isBatchesError, error: batchesError } =
    useGetBatchesWithArticlesCount(selectedStation ?? undefined);

  const { data: searchedBatches, isLoading: isLoadingSearch, isError: isSearchError, error: searchError } =
    useSearchBatchesByPartNumber(selectedStation ?? undefined, debouncedSearchTerm || undefined);

  // Memoización de batches a mostrar
  const displayedBatches = useMemo(() => {
    if (!allBatches) return [];
    if (!debouncedSearchTerm || debouncedSearchTerm === "") return allBatches;
    if (searchedBatches) {
      const searchedBatchIds = new Set(searchedBatches.map(b => b.id));
      return allBatches.filter(batch => searchedBatchIds.has(batch.id));
    }
    return [];
  }, [allBatches, searchedBatches, debouncedSearchTerm]);

  // Estados derivados
  const isLoading = isLoadingBatches || !!(debouncedSearchTerm && isLoadingSearch);
  const isEmptyState = !isLoading && displayedBatches?.length === 0;
  const showNoResults = !isLoading && !!debouncedSearchTerm && isEmptyState;

  return (
    <ContentLayout title='Inventario'>
      <div className='flex flex-col gap-y-2'>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/hangar74/dashboard">Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Inventario General</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className='text-4xl font-bold text-center'>Inventario General</h1>
        <p className='text-sm text-muted-foreground text-center  italic'>
          Aquí puede observar todos los renglones de los diferentes almacenes. <br />Filtre y/o busque sí desea un renglón en específico.
        </p>
        <SearchSection
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          debouncedSearchTerm={debouncedSearchTerm}
          showNoResults={showNoResults}
        />

        {isLoading ? (
          <div className='flex w-full h-full justify-center items-center min-h-[300px]'>
            <Loader2 className='size-24 animate-spin' />
          </div>
        ) : (
          <>
            {allBatches && (
              <DataTable
                columns={columns}
                initialData={displayedBatches}
                isSearching={!!debouncedSearchTerm}
                searchTerm={debouncedSearchTerm}
              />
            )}

            {isBatchesError && (
              <div className="text-red-500 text-center text-sm italic text-muted-foreground">
                Error cargando batches: {batchesError.message}
              </div>
            )}

            {isSearchError && (
              <div className="text-red-500 text-center text-sm italic text-muted-foreground">
                Error en búsqueda: {searchError.message}
              </div>
            )}
          </>
        )}
      </div>
    </ContentLayout>
  )
}

export default InventarioPage
