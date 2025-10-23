"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Loader2, Package, Save } from "lucide-react";
import React, { useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useGetWarehouseArticlesByCategory } from "@/hooks/mantenimiento/almacen/articulos/useGetWarehouseArticlesByCategory";
// import { useGetWarehouseArticlesByCategory } from "@/hooks/mantenimiento/almacen/articulos/useGetWarehouseArticlesByCategory";
import { useGetAllWarehouseZones } from "@/hooks/mantenimiento/almacen/articulos/useGetAllWarehouseZones";
import { useSearchBatchesByPartNumber } from "@/hooks/mantenimiento/almacen/renglones/useGetBatchesByArticlePartNumber";
import { useUpdateArticleQuantityAndZone } from "@/actions/mantenimiento/almacen/articulos/useUpdateArticleQuantityAndZone";
import { BatchCard } from "./_components/BatchCard";
import { EmptyState } from "./_components/EmptyState";
import { PaginationControls } from "./_components/PaginationControls";
import { useArticleChanges } from "./_components/hooks/useArticleChanges";
import { useBackendPagination } from "./_components/hooks/usePagination";
import { useGlobalSearch } from "./_components/hooks/useGlobalSearch";
import { FilterPanel } from "./_components/FilterPanel";
import LoadingPage from "@/components/misc/LoadingPage";
const GestionCantidadesPage = () => {
  const { selectedCompany, selectedStation } = useCompanyStore();

  // Hook de paginación del backend
  const {
    currentPage,
    itemsPerPage,
    createPaginationInfo,
    createPaginationActions,
    scrollTargetRef,
  } = useBackendPagination({ initialPage: 1, initialPerPage: 25 });

  // Obtener todos los batches con artículos enviando page y per_page al backend
  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useGetWarehouseArticlesByCategory(currentPage, itemsPerPage, "CONSUMIBLE");
  // } = useGetWarehouseArticlesByCategory(currentPage, itemsPerPage, "CONSUMABLE");

  // Obtener todas las zonas del almacén para los selects
  const {
    data: allWarehouseZones,
    isLoading: isLoadingZones,
  } = useGetAllWarehouseZones();

  // Extraer batches y paginationInfo de la respuesta
  // Memoize para evitar crear nuevas referencias en cada render
  const batches = useMemo(() => response?.batches || [], [response?.batches]);
  const zones = useMemo(() => (allWarehouseZones as string[]) || [], [allWarehouseZones]);
  const paginationInfo = createPaginationInfo(response?.pagination);
  const paginationActions = createPaginationActions(paginationInfo.totalPages);

  // Hook para búsqueda global y filtros
  const {
    state: filterState,
    actions: filterActions,
    stats: filterStats,
  } = useGlobalSearch(batches, zones);



  // Hook para manejar cambios en artículos usando batches filtrados
  const {
    state: { quantities, zones: articleZones, hasChanges },
    actions: { handleQuantityChange, handleZoneChange },
    utils: { getModifiedArticles, modifiedCount },
  } = useArticleChanges(filterStats.filteredBatches);

  const { updateArticleQuantityAndZone } = useUpdateArticleQuantityAndZone();

  const handleSave = useCallback(() => {
    const modifiedEntries = getModifiedArticles();

    if (modifiedEntries.length === 0) {
      toast.info("No hay cambios para guardar");
      return;
    }

    const requestPayload = {
      updates: modifiedEntries.map((entry) => ({
        article_id: entry.articleId,
        ...(entry.quantityChanged && { new_quantity: entry.newQuantity }),
        ...(entry.zoneChanged && { new_zone: entry.newZone }),
      })),
      company: selectedCompany!.slug,
    };


    updateArticleQuantityAndZone.mutate(requestPayload);
  }, [getModifiedArticles, selectedCompany, updateArticleQuantityAndZone]);


  if (isLoading) {
    return (
      <LoadingPage/>
    );
  }

  // if (isError) {
  //   return (
  //     <ContentLayout title="Gestión de Cantidades y Ubicaciones">
  //       <div className="text-center py-8">
  //         <p className="text-sm text-muted-foreground">
  //           Ha ocurrido un error al cargar los artículos...
  //         </p>
  //       </div>
  //     </ContentLayout>
  //   );
  // }


  return (
    <ContentLayout title="Gestión de Cantidades y Ubicaciones">
      <div className="flex flex-col gap-4">
        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${selectedCompany?.slug}/dashboard`}>
                Inicio
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Almacén</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Inventario</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Gestión de Cantidades</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Scroll target para paginación */}
        <div ref={scrollTargetRef} className="scroll-mt-4" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Package className="h-8 w-8" />
              Gestión de Cantidades y Ubicaciones
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Actualiza las cantidades de consumibles y las ubicaciones de componentes en el almacén
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={!hasChanges}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Guardar Cambios
            {hasChanges && modifiedCount > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {modifiedCount}
              </span>
            )}
          </Button>
        </div>

        {/* Filter Panel */}
        <FilterPanel 
          batches={batches}
          filterState={filterState}
          filterActions={filterActions}
          stats={filterStats}
        />

        {/* Performance Info */}
        <div className="bg-muted/50 p-3 rounded-lg">
          <p className="text-sm text-muted-foreground">
            {filterStats.isSearching ? (
              <span className="text-blue-600">🔍 Buscando en toda la base de datos...</span>
            ) : filterState.partNumberFilter ? (
              <span>
                ✅ Resultados de búsqueda global
                {filterStats.hasActiveFilters && (
                  <span className="ml-2 text-blue-600">
                    • {filterStats.articleCounts.filteredArticles} artículos encontrados
                  </span>
                )}
              </span>
            ) : (
              <span>
                Mostrando {paginationInfo.from} - {paginationInfo.to} de {paginationInfo.totalItems} batches
                • Página {paginationInfo.currentPage} de {paginationInfo.totalPages}
                • {paginationInfo.itemsPerPage} por página
                {filterStats.hasActiveFilters && (
                  <span className="ml-2 text-blue-600">
                    • {filterStats.articleCounts.filteredArticles} artículos filtrados
                  </span>
                )}
              </span>
            )}
            {/* Info de zonas */}
            <span className="ml-2 text-green-600">
              • {isLoadingZones ? "Cargando zonas..." : `${zones.length} zonas disponibles`}
            </span>
          </p>
        </div>

        {/* Articles by Batch - Datos filtrados */}
        {filterStats.filteredBatches && Array.isArray(filterStats.filteredBatches) && filterStats.filteredBatches.map((batch) => (
          <BatchCard
            key={batch.batch_id}
            batch={batch}
            quantities={quantities}
            zones={articleZones}
            availableZones={zones} // Todas las zonas del inventario (memoized)
            onQuantityChange={handleQuantityChange}
            onZoneChange={handleZoneChange}
          />
        ))}

        {/* Pagination Controls - Ocultar durante búsqueda global */}
        {!filterState.partNumberFilter && (
          <PaginationControls
            paginationInfo={paginationInfo}
            paginationActions={paginationActions}
          />
        )}

        {/* Empty State */}
        {(!filterStats.filteredBatches || !Array.isArray(filterStats.filteredBatches) || filterStats.filteredBatches.length === 0) && !isLoading && !filterStats.isSearching && (
          <EmptyState 
            hasActiveFilters={filterStats.hasActiveFilters} 
            onClearFilters={filterActions.clearFilters} 
          />
        )}
      </div>
    </ContentLayout>
  );
};

export default GestionCantidadesPage;