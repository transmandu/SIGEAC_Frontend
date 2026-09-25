"use client";

import { Button } from "@/components/ui/button";
import { CursorPagination } from "@/components/tables/CursorPagination";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Package, Save } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/helpers/useDebounce";
import { useGetAllWarehouseZones } from "@/hooks/mantenimiento/almacen/articulos/useGetAllWarehouseZones";
import { useStockAdjustmentArticles } from "@/hooks/mantenimiento/almacen/inventario/useStockAdjustmentArticles";
import { useUpdateArticleQuantityAndZone } from "@/actions/mantenimiento/almacen/articulos/useUpdateArticleQuantityAndZone";
import { BatchCard } from "./BatchCard";
import { EmptyState } from "./EmptyState";
import { useArticleChanges } from "./hooks/useArticleChanges";
import { FilterPanel } from "./FilterPanel";
import LoadingPage from "@/components/misc/LoadingPage";

export const InventarioAeronauticoTab = () => {
  const { selectedCompany } = useCompanyStore();
  const scrollTargetRef = useRef<HTMLDivElement>(null);

  const [selectedZone, setSelectedZone] = useState("all");
  const [search, setSearch] = useState("");
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const debouncedSearch = useDebounce(search.trim(), 400);

  // Consumibles y componentes por renglón completo; la búsqueda y la zona las
  // resuelve el servidor sobre todo el inventario, no sobre la página.
  const {
    rows: batches,
    total,
    isLoading,
    isFetching,
    pagination,
  } = useStockAdjustmentArticles({
    search: debouncedSearch || undefined,
    zone: selectedZone !== "all" ? selectedZone : undefined,
  });

  const { data: allWarehouseZones, isLoading: isLoadingZones } =
    useGetAllWarehouseZones();
  const zones = (allWarehouseZones as string[] | undefined) ?? [];

  const {
    state: { quantities, zones: articleZones, hasChanges },
    actions: { handleQuantityChange, handleZoneChange, commitChanges },
    utils: { getModifiedArticles, modifiedCount },
  } = useArticleChanges(batches);

  const { updateArticleQuantityAndZone } = useUpdateArticleQuantityAndZone();

  const handleSave = useCallback(() => {
    const modifiedEntries = getModifiedArticles();

    if (modifiedEntries.length === 0) {
      toast.info("No hay cambios para guardar");
      return;
    }

    updateArticleQuantityAndZone.mutate(
      {
        updates: modifiedEntries.map((entry) => ({
          article_id: entry.articleId,
          ...(entry.quantityChanged && { new_quantity: entry.newQuantity }),
          ...(entry.zoneChanged && { new_zone: entry.newZone }),
        })),
        company: selectedCompany!.slug,
      },
      { onSuccess: commitChanges },
    );
  }, [
    getModifiedArticles,
    selectedCompany,
    updateArticleQuantityAndZone,
    commitChanges,
  ]);

  const changePage = (move: () => void) => {
    move();
    scrollTargetRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  const hasActiveFilters = selectedZone !== "all" || search.trim() !== "";
  const summary =
    total !== undefined
      ? `${total.toLocaleString("es-VE")} renglón(es) de consumibles y componentes`
      : undefined;

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
            ubicaciones de consumibles. Los cambios se conservan al cambiar de
            página hasta guardarlos.
          </p>
        </div>
        {hasChanges && (
          <Button
            onClick={handleSave}
            disabled={updateArticleQuantityAndZone.isPending}
            className="flex items-center gap-2"
          >
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
        filterState={{ selectedZone, search, filtersExpanded }}
        filterActions={{
          setSelectedZone,
          setSearch,
          setFiltersExpanded,
          clearFilters: () => {
            setSelectedZone("all");
            setSearch("");
          },
        }}
        availableZones={zones}
        summary={summary}
      />

      <div className="bg-muted/50 p-3 rounded-lg">
        <p className="text-sm text-muted-foreground">
          {isFetching ? (
            <span className="text-blue-600">Buscando...</span>
          ) : (
            summary
          )}
          <span className="ml-2 text-green-600">
            •{" "}
            {isLoadingZones
              ? "Cargando zonas..."
              : `${zones.length} zonas disponibles`}
          </span>
        </p>
      </div>

      {batches.map((batch) => (
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

      {batches.length === 0 && !isFetching && (
        <EmptyState
          hasActiveFilters={hasActiveFilters}
          onClearFilters={() => {
            setSelectedZone("all");
            setSearch("");
          }}
        />
      )}

      <CursorPagination
        {...pagination}
        summary={summary}
        onNextPage={() => changePage(pagination.onNextPage)}
        onPrevPage={() => changePage(pagination.onPrevPage)}
      />
    </div>
  );
};
