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
import { useSearchBatchesByPartNumber } from '@/hooks/mantenimiento/almacen/renglones/useGetBatchesByArticlePartNumber';
import { useSearchArticlesByPartNumberMock } from '@/hooks/mantenimiento/almacen/renglones/useSearchArticlesByPartNumber.mock';
import { useSearchBatchesWithArticlesMock } from '@/hooks/mantenimiento/almacen/renglones/useSearchBatchesWithArticles.mock';
// HOOKS REALES COMENTADOS - DESCOMENTAR CUANDO EL BACKEND ESTÉ LISTO
import { useSearchArticlesByPartNumber } from '@/hooks/mantenimiento/almacen/renglones/useSearchArticlesByPartNumber';
import { useSearchBatchesWithArticles } from '@/hooks/mantenimiento/almacen/renglones/useSearchBatchesWithArticles';
import { useGetBatchesWithArticlesCount } from '@/hooks/mantenimiento/almacen/renglones/useGetBatchesWithArticleCount';
import { useCompanyStore } from '@/stores/CompanyStore';
import { Loader2, List, Package } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import SearchSection from './_components/SearchSection';
import { columns } from './columns';
import { DataTable } from './data-table';
import { Button } from '@/components/ui/button';
import { BatchWithArticlesView } from './_components/BatchWithArticlesView';

const InventarioPage = () => {
  const { selectedStation, selectedCompany } = useCompanyStore();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [viewMode, setViewMode] = useState<'organized' | 'batches'>('organized');

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
    useSearchBatchesByPartNumber( selectedCompany?.slug, selectedStation ?? undefined, debouncedSearchTerm.trim() ? debouncedSearchTerm : undefined);

  // Consulta para obtener artículos detallados (vista de lista)
  // const { data: searchedArticles, isLoading: isLoadingArticles, isError: isArticlesError, error: articlesError } =
  //   useSearchArticlesByPartNumberMock( selectedCompany?.slug, selectedStation?.toString(), debouncedSearchTerm || undefined);

  // Consulta para obtener batches con artículos detallados (vista organizada)
  // const { data: batchesWithArticles, isLoading: isLoadingBatchesWithArticles, isError: isBatchesWithArticlesError, error: batchesWithArticlesError } =
  //   useSearchBatchesWithArticlesMock( selectedCompany?.slug, selectedStation?.toString(), debouncedSearchTerm || undefined);

  // HOOK DE ARTÍCULOS COMENTADO - YA NO SE USA PORQUE SE REMOVIÓ LA VISTA
  // const { data: searchedArticles, isLoading: isLoadingArticles, isError: isArticlesError, error: articlesError } =
  //   useSearchArticlesByPartNumber( selectedCompany?.slug, selectedStation?.toString(), debouncedSearchTerm.trim() ? debouncedSearchTerm : undefined);
  const { data: batchesWithArticles, isLoading: isLoadingBatchesWithArticles, isError: isBatchesWithArticlesError, error: batchesWithArticlesError } =
    useSearchBatchesWithArticles( selectedCompany?.slug, selectedStation?.toString(), debouncedSearchTerm.trim() ? debouncedSearchTerm : undefined);

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
  const hasSearchTerm = debouncedSearchTerm && debouncedSearchTerm.trim() !== "";
  const isLoading = isLoadingBatches || !!(hasSearchTerm && (isLoadingSearch || isLoadingBatchesWithArticles));
  const isEmptyState = !isLoading && displayedBatches?.length === 0;
  const showNoResults = !isLoading && !!debouncedSearchTerm && isEmptyState;
  const showNoBatchesWithArticlesResults = !isLoading && !!debouncedSearchTerm && (!batchesWithArticles || batchesWithArticles.length === 0);
  
  // Determinar si mostrar las vistas de búsqueda basada en si hay búsqueda
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
              /* Vistas de búsqueda con selector de vista */
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="bg-muted p-1 rounded-lg inline-flex">
                    <Button
                      variant={viewMode === 'organized' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('organized')}
                      className="flex items-center gap-2"
                    >
                      <Package className="h-4 w-4" />
                      Vista Organizada ({batchesWithArticles?.length || 0} batches)
                    </Button>
                    <Button
                      variant={viewMode === 'batches' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('batches')}
                      className="flex items-center gap-2"
                    >
                      <List className="h-4 w-4" />
                      Vista de Renglones ({displayedBatches?.length || 0})
                    </Button>
                  </div>
                </div>

                {viewMode === 'organized' ? (
                  /* Vista organizada con batches expandibles */
                  <>
                    {showNoBatchesWithArticlesResults ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No se encontraron batches con artículos que coincidan con: <strong>"{searchTerm}"</strong></p>
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
                ) : (
                  /* Vista de batches/renglones */
                  <>
                    {showNoResults ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No se encontraron renglones con artículos que coincidan con: <strong>"{searchTerm}"</strong></p>
                      </div>
                    ) : (
                      <DataTable
                        columns={columns}
                        initialData={displayedBatches}
                        isSearching={true}
                        searchTerm={debouncedSearchTerm}
                      />
                    )}
                  </>
                )}
              </div>
            ) : (
              /* Vista normal de renglones cuando no hay búsqueda */
              allBatches && (
                <DataTable
                  columns={columns}
                  initialData={displayedBatches}
                  isSearching={false}
                  searchTerm=""
                />
              )
            )}

            {/* Mensajes de error */}
            {isBatchesError && (
              <div className="text-red-500 text-center text-sm italic text-muted-foreground">
                Error cargando renglones: {batchesError.message}
              </div>
            )}

            {isSearchError && (
              <div className="text-red-500 text-center text-sm italic text-muted-foreground">
                Error en búsqueda de renglones: {searchError.message}
              </div>
            )}


            {isBatchesWithArticlesError && (
              <div className="text-red-500 text-center text-sm italic text-muted-foreground">
                Error en vista organizada: {batchesWithArticlesError.message}
              </div>
            )}
          </>
        )}
      </div>
    </ContentLayout>
  )
}

export default InventarioPage
