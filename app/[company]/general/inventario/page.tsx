'use client';

import { ContentLayout } from '@/components/layout/ContentLayout';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useDebounce } from '@/hooks/helpers/useDebounce';
import { useSearchBatchesWithArticles } from '@/hooks/mantenimiento/almacen/renglones/useSearchBatchesWithArticles';
import { useGetBatchesWithArticlesCount } from '@/hooks/mantenimiento/almacen/renglones/useGetBatchesWithArticleCount';
import { useCompanyStore } from '@/stores/CompanyStore';
import { Loader2, Package } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import SearchSection from './_components/SearchSection';
import { columns } from './columns';
import { DataTable } from './data-table';
import { BatchWithArticlesView } from './_components/BatchWithArticlesView';

const InventarioPage = () => {
  const { selectedStation, selectedCompany } = useCompanyStore();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [transitionLoading, setTransitionLoading] = useState(false);
  useEffect(() => {
    setTransitionLoading(true);
    const timeout = setTimeout(() => setTransitionLoading(false), 500);
    return () => clearTimeout(timeout);
  }, [debouncedSearchTerm]);

  const { data: allBatches, isLoading: isLoadingBatches, isError: isBatchesError, error: batchesError } =
    useGetBatchesWithArticlesCount({company: selectedCompany?.slug, location_id: selectedStation ?? undefined});

  const { data: batchesWithArticles, isLoading: isLoadingBatchesWithArticles, isError: isBatchesWithArticlesError, error: batchesWithArticlesError } =
    useSearchBatchesWithArticles( selectedCompany?.slug, selectedStation?.toString(), debouncedSearchTerm.trim() ? debouncedSearchTerm : undefined);
  const hasSearchTerm = debouncedSearchTerm && debouncedSearchTerm.trim() !== "";
  const isLoading = isLoadingBatches || !!(hasSearchTerm && isLoadingBatchesWithArticles);
  const showNoBatchesWithArticlesResults = !isLoading && !!debouncedSearchTerm && (!batchesWithArticles || batchesWithArticles.length === 0);
  const shouldShowSearchViews = hasSearchTerm;

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
          showNoResults={false}
        />

        {isLoading ? (
          <div className='flex w-full h-full justify-center items-center min-h-[300px]'>
            <Loader2 className='size-24 animate-spin' />
          </div>
        ) : (
          <>
            {shouldShowSearchViews ? (
              <div className="space-y-4">
                <>
                  {showNoBatchesWithArticlesResults ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No se encontraron batches con artículos que coincidan con: <strong>&quot;{searchTerm}&quot;</strong></p>
                      <p className="text-sm mt-1">Intente con otro número de parte o verifique la ortografía.</p>
                    </div>
                  ) : (
                    batchesWithArticles && (
                      <BatchWithArticlesView 
                        batches={batchesWithArticles}
                        companySlug={selectedCompany?.slug}
                      />
                    )
                  )}
                </>
              </div>
            ) : (
              allBatches && (
                <DataTable
                  columns={columns}
                  initialData={allBatches}
                  isSearching={false}
                  searchTerm=""
                />
              )
            )}

            {isBatchesError && (
              <div className="text-red-500 text-center text-sm italic text-muted-foreground">
              </div>
            )}
          </>
        )}
      </div>
    </ContentLayout>
  )
}

export default InventarioPage

