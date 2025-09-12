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
import React, { useCallback } from "react";
import { toast } from "sonner";
import { useGetWarehouseConsumableArticles } from "@/hooks/mantenimiento/almacen/articulos/useGetWarehouseConsumableArticles";
import { useUpdateArticleQuantityAndZone } from "@/actions/mantenimiento/almacen/articulos/useUpdateArticleQuantityAndZone";
import { FilterPanel } from "./_components/FilterPanel";
import { BatchCard } from "./_components/BatchCard";
import { EmptyState } from "./_components/EmptyState";
import { useArticleChanges } from "./_components/hooks/useArticleChanges";
import { useFilters } from "./_components/hooks/useFilters";
const GestionCantidadesPage = () => {
  const { selectedCompany, selectedStation } = useCompanyStore();

  // Obtener todos los batches con artículos
  const {
    data: batches,
    isLoading,
    isError,
  } = useGetWarehouseConsumableArticles(
    selectedCompany?.slug,
    selectedStation!
  );

  // Hooks personalizados para lógica separada
  const {
    state: { quantities, zones, hasChanges },
    actions: { handleQuantityChange, handleZoneChange },
    utils: { getModifiedArticles, modifiedCount },
  } = useArticleChanges(batches);

  const {
    stats: { filteredBatches, availableZones, hasActiveFilters },
    actions: { clearFilters },
  } = useFilters(batches);

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
      <ContentLayout title="Gestión de Cantidades y Ubicaciones">
        <div className="flex w-full h-full justify-center items-center">
          <Loader2 className="size-24 animate-spin mt-48" />
        </div>
      </ContentLayout>
    );
  }

  if (isError) {
    return (
      <ContentLayout title="Gestión de Cantidades y Ubicaciones">
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            Ha ocurrido un error al cargar los artículos...
          </p>
        </div>
      </ContentLayout>
    );
  }

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

        {/* Filtros */}
        <FilterPanel batches={batches} />

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

        {/* Articles by Batch */}
        {filteredBatches.map((batch) => (
          <BatchCard
            key={batch.batch_id}
            batch={batch}
            quantities={quantities}
            zones={zones}
            availableZones={availableZones}
            onQuantityChange={handleQuantityChange}
            onZoneChange={handleZoneChange}
          />
        ))}

        {/* Empty State */}
        {filteredBatches && filteredBatches.length === 0 && (
          <EmptyState 
            hasActiveFilters={hasActiveFilters} 
            onClearFilters={clearFilters} 
          />
        )}
      </div>
    </ContentLayout>
  );
};

export default GestionCantidadesPage;