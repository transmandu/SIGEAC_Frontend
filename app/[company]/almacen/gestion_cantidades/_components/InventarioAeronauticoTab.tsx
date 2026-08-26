"use client";

import { Button } from "@/components/ui/button";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Package, Save } from "lucide-react";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useGetWarehouseArticlesByCategory } from "@/hooks/mantenimiento/almacen/articulos/useGetWarehouseArticlesByCategory";
import { useGetAllWarehouseZones } from "@/hooks/mantenimiento/almacen/articulos/useGetAllWarehouseZones";
import { useUpdateArticleQuantityAndZone } from "@/actions/mantenimiento/almacen/articulos/useUpdateArticleQuantityAndZone";
import { BatchCard } from "./BatchCard";
import { EmptyState } from "./EmptyState";
import { PaginationControls } from "./PaginationControls";
import { useArticleChanges } from "./hooks/useArticleChanges";
import { useBackendPagination } from "./hooks/usePagination";
import { useGlobalSearch } from "./hooks/useGlobalSearch";
import { FilterPanel } from "./FilterPanel";
import LoadingPage from "@/components/misc/LoadingPage";

export const InventarioAeronauticoTab = () => {
  const { selectedCompany } = useCompanyStore();

  const {
    currentPage,
    itemsPerPage,
    createPaginationInfo,
    createPaginationActions,
    scrollTargetRef,
  } = useBackendPagination({ initialPage: 1, initialPerPage: 25 });

  const {
    data: consumableResponse,
    isLoading: isLoadingConsumables,
  } = useGetWarehouseArticlesByCategory(currentPage, itemsPerPage, "CONSUMABLE");

  const {
    data: componentResponse,
    isLoading: isLoadingComponents,
  } = useGetWarehouseArticlesByCategory(currentPage, itemsPerPage, "COMPONENT");

  const isLoading = isLoadingConsumables || isLoadingComponents;

  const { data: allWarehouseZones, isLoading: isLoadingZones } =
    useGetAllWarehouseZones();

  const batches = useMemo(() => {
    const consumableBatches = consumableResponse?.batches || [];
    const componentBatches = componentResponse?.batches || [];
    return [...consumableBatches, ...componentBatches];
  }, [consumableResponse?.batches, componentResponse?.batches]);

  const response = useMemo(() => {
    if (!consumableResponse && !componentResponse) return null;

    const combinedTotal =
      (consumableResponse?.pagination?.total || 0) +
      (componentResponse?.pagination?.total || 0);

    return {
      batches,
      pagination: {
        current_page:
          consumableResponse?.pagination?.current_page ||
          componentResponse?.pagination?.current_page ||
          1,
        total: combinedTotal,
        per_page: itemsPerPage,
        last_page: Math.ceil(combinedTotal / itemsPerPage),
        from:
          consumableResponse?.pagination?.from ||
          componentResponse?.pagination?.from ||
          0,
        to:
          (consumableResponse?.pagination?.to || 0) +
          (componentResponse?.pagination?.to || 0),
      },
    };
  }, [consumableResponse, componentResponse, batches, itemsPerPage]);

  const zones = useMemo(
    () => (allWarehouseZones as string[]) || [],
    [allWarehouseZones],
  );
  const paginationInfo = createPaginationInfo(response?.pagination);
  const paginationActions = createPaginationActions(paginationInfo.totalPages);

  const {
    state: filterState,
    actions: filterActions,
    stats: filterStats,
  } = useGlobalSearch(batches, zones);

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

    updateArticleQuantityAndZone.mutate({
      updates: modifiedEntries.map((entry) => ({
        article_id: entry.articleId,
        ...(entry.quantityChanged && { new_quantity: entry.newQuantity }),
        ...(entry.zoneChanged && { new_zone: entry.newZone }),
      })),
      company: selectedCompany!.slug,
    });
  }, [getModifiedArticles, selectedCompany, updateArticleQuantityAndZone]);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div ref={scrollTargetRef} className="scroll-mt-4" />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Package className="h-6 w-6" />
            Cantidades y Ubicaciones
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Actualiza las ubicaciones de componentes. Modifica cantidades y
            ubicaciones de consumibles
          </p>
        </div>
        {hasChanges && (
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Guardar Cambios
            {modifiedCount > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {modifiedCount}
              </span>
            )}
          </Button>
        )}
      </div>

      <FilterPanel
        batches={batches}
        filterState={filterState}
        filterActions={filterActions}
        stats={filterStats}
      />

      <div className="bg-muted/50 p-3 rounded-lg">
        <p className="text-sm text-muted-foreground">
          {filterStats.isSearching ? (
            <span className="text-blue-600">
              Buscando en toda la base de datos...
            </span>
          ) : filterState.partNumberFilter ? (
            <span>
              Resultados de búsqueda global
              {filterStats.hasActiveFilters && (
                <span className="ml-2 text-blue-600">
                  • {filterStats.articleCounts.filteredArticles} artículos
                  encontrados
                </span>
              )}
            </span>
          ) : (
            <span>
              Mostrando {paginationInfo.from} - {paginationInfo.to} de{" "}
              {paginationInfo.totalItems} batches • Página{" "}
              {paginationInfo.currentPage} de {paginationInfo.totalPages} •{" "}
              {paginationInfo.itemsPerPage} por página
              {filterStats.hasActiveFilters && (
                <span className="ml-2 text-blue-600">
                  • {filterStats.articleCounts.filteredArticles} artículos
                  filtrados
                </span>
              )}
            </span>
          )}
          <span className="ml-2 text-green-600">
            •{" "}
            {isLoadingZones
              ? "Cargando zonas..."
              : `${zones.length} zonas disponibles`}
          </span>
        </p>
      </div>

      {Array.isArray(filterStats.filteredBatches) &&
        filterStats.filteredBatches.map((batch) => (
          <BatchCard
            key={batch.batch_id}
            batch={batch}
            quantities={quantities}
            zones={articleZones}
            availableZones={zones}
            onQuantityChange={handleQuantityChange}
            onZoneChange={handleZoneChange}
          />
        ))}

      {!filterState.partNumberFilter && (
        <PaginationControls
          paginationInfo={paginationInfo}
          paginationActions={paginationActions}
        />
      )}

      {(!Array.isArray(filterStats.filteredBatches) ||
        filterStats.filteredBatches.length === 0) &&
        !filterStats.isSearching && (
          <EmptyState
            hasActiveFilters={filterStats.hasActiveFilters}
            onClearFilters={filterActions.clearFilters}
          />
        )}
    </div>
  );
};
