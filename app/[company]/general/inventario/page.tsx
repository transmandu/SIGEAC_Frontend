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
import { useMemo, useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/helpers/useDebounce';
import { Input } from '@/components/ui/input';
import SearchSection from './_components/SearchSection';

const InventarioPage = () => {
  const { selectedStation, selectedCompany } = useCompanyStore();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Loading de transición de 500ms cuando cambia el término de búsqueda
  const [transitionLoading, setTransitionLoading] = useState(false);
  useEffect(() => {
    setTransitionLoading(true);
    const timeout = setTimeout(() => setTransitionLoading(false), 500);
    return () => clearTimeout(timeout);
  }, [debouncedSearchTerm]);

  // Consultas a la API
  const { data: allBatches, isLoading: isLoadingBatches, isError: isBatchesError, error: batchesError } =
    useGetBatchesWithArticlesCount({company: selectedCompany?.slug, location_id: selectedStation ?? undefined});

  const { data: searchedBatches, isLoading: isLoadingSearch, isError: isSearchError, error: searchError } =
    useSearchBatchesByPartNumber( selectedCompany?.slug, selectedStation ?? undefined, debouncedSearchTerm || undefined);

  // Memoización de batches a mostrar
  const displayedBatches = useMemo(() => {
    if (!allBatches) return [];

    // Si el input (debounced) está vacío, mostrar todos los batches
    if (!debouncedSearchTerm || debouncedSearchTerm.trim() === "") {
      return allBatches;
    }

    // Si hay término de búsqueda y hay resultados, filtrar
    if (searchedBatches && searchedBatches.length > 0) {
      const searchedBatchIds = new Set(searchedBatches.map(b => b.id));
      return allBatches.filter(batch => searchedBatchIds.has(batch.id));
    }

    // Si hay término de búsqueda pero no hay resultados, retornar array vacío
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
              <BreadcrumbLink href={`/${selectedCompany?.slug}/dashboard`}>Inicio</BreadcrumbLink>
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
                isSearching={!!debouncedSearchTerm && debouncedSearchTerm.trim() !== ""}
                searchTerm={debouncedSearchTerm && debouncedSearchTerm.trim() !== "" ? debouncedSearchTerm : ""}
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
