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
import { Package, Save, History } from "lucide-react";
import React, { useState } from "react";
import { useGetWarehouseConsumableArticles } from "@/hooks/mantenimiento/almacen/articulos/useGetWarehouseConsumableArticles";
import { useGetAllWarehouseZones } from "@/hooks/mantenimiento/almacen/articulos/useGetAllWarehouseZones";
import { BatchCard } from "@/components/cards/BatchCard";
import { EmptyState } from "@/components/misc/EmptyState";
import { PaginationControls } from "@/components/tables/PaginationControls";
import { useArticleChanges } from "./_components/hooks/useArticleChanges";
import { useBackendPagination } from "@/hooks/helpers/usePagination";
import { useFilters } from "@/hooks/helpers/useFilters";
import { FilterPanel } from "@/components/misc/FilterPanel";
import { ChangesPanel } from "@/components/misc/ChangesPanel";
import { useSaveChanges } from "./_components/hooks/useSaveChanges";
import { PAGINATION_CONFIG } from "./_components/constants";
import LoadingPage from "@/components/misc/LoadingPage";

const GestionCantidadesPage = () => {
  const { selectedCompany } = useCompanyStore();
  const [changesExpanded, setChangesExpanded] = useState(false);

  // Data fetching
  const { currentPage, itemsPerPage, createPaginationInfo, createPaginationActions, scrollTargetRef } = 
    useBackendPagination({ 
      initialPage: PAGINATION_CONFIG.INITIAL_PAGE, 
      initialPerPage: PAGINATION_CONFIG.INITIAL_PER_PAGE 
    });
  
  const { data: response, isLoading } = useGetWarehouseConsumableArticles(currentPage, itemsPerPage);
  const { data: allWarehouseZones, isLoading: isLoadingZones } = useGetAllWarehouseZones();

  // Data processing
  const batches = response?.batches || [];
  const paginationInfo = createPaginationInfo(response?.pagination);
  const paginationActions = createPaginationActions(paginationInfo.totalPages);

  // Filters
  const { state: filterState, actions: filterActions, stats: filterStats } = useFilters(batches);

  // Article changes management
  const {
    state: { quantities, zones, justifications, hasChanges },
    actions: { handleQuantityChange, handleZoneChange, handleJustificationChange },
    utils: { getModifiedArticles, modifiedCount, articlesWithoutJustificationCount, canSave },
  } = useArticleChanges(filterStats.filteredBatches);

  // Save changes hook
  const { handleSave, isSaving } = useSaveChanges({
    getModifiedArticles,
    articlesWithoutJustificationCount,
    companySlug: selectedCompany?.slug || "",
  });

  if (isLoading) return <LoadingPage />;

  return (
    <ContentLayout title="Gestión de Cantidades y Ubicaciones">
      <div className="flex flex-col gap-4">
        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${selectedCompany?.slug}/dashboard`}>Inicio</BreadcrumbLink>
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
            {hasChanges && articlesWithoutJustificationCount > 0 && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">
                  ⚠ <strong>{articlesWithoutJustificationCount}</strong> artículo(s) necesitan justificación para proceder
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <a href={`/${selectedCompany?.slug}/almacen/gestion_cantidades/historial`} className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Ver Historial
              </a>
            </Button>
            <Button onClick={handleSave} disabled={!canSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {!hasChanges ? "Sin Cambios" : !canSave ? "Justificación Requerida" : "Guardar Cambios"}
              {modifiedCount > 0 && (
                <span className={`ml-1 text-white text-xs px-2 py-1 rounded-full ${
                  canSave ? "bg-green-500" : "bg-red-500"
                }`}>
                  {modifiedCount}{!canSave && " ⚠"}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        <FilterPanel 
          batches={batches}
          filterState={filterState}
          filterActions={filterActions}
          stats={{
            ...filterStats,
            availableZones: (allWarehouseZones as string[]) || []
          }}
        />

        {/* Changes Panel */}
        <ChangesPanel
          modifiedArticles={getModifiedArticles()}
          isExpanded={changesExpanded}
          onToggleExpanded={setChangesExpanded}
          batches={batches}
        />

        {/* Performance Info */}
        <div className="bg-muted/50 p-3 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Mostrando {paginationInfo.from} - {paginationInfo.to} de {paginationInfo.totalItems} batches
            • Página {paginationInfo.currentPage} de {paginationInfo.totalPages}
            {filterStats.hasActiveFilters && (
              <span className="ml-2 text-blue-600">
                • {filterStats.articleCounts.filteredArticles} artículos filtrados
              </span>
            )}
            <span className="ml-2 text-green-600">
              • {isLoadingZones ? "Cargando zonas..." : `${(allWarehouseZones as string[])?.length || 0} zonas disponibles`}
            </span>
          </p>
        </div>

        {/* Articles by Batch */}
        {filterStats.filteredBatches?.map((batch) => (
          <BatchCard
            key={batch.batch_id}
            batch={batch}
            quantities={quantities}
            zones={zones}
            justifications={justifications}
            availableZones={(allWarehouseZones as string[]) || []}
            onQuantityChange={handleQuantityChange}
            onZoneChange={handleZoneChange}
            onJustificationChange={handleJustificationChange}
          />
        ))}

        {/* Pagination */}
        <PaginationControls paginationInfo={paginationInfo} paginationActions={paginationActions} />

        {/* Empty State */}
        {(!filterStats.filteredBatches?.length && !isLoading) && (
          <EmptyState hasActiveFilters={filterStats.hasActiveFilters} onClearFilters={filterActions.clearFilters} />
        )}
      </div>
    </ContentLayout>
  );
};

export default GestionCantidadesPage;