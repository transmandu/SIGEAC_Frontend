import { useCallback, useMemo, useState } from "react";
import { useDebounce } from "@/lib/useDebounce";
import { useSearchBatchesWithArticles, BatchWithArticles } from "@/hooks/mantenimiento/almacen/renglones/useSearchBatchesWithArticles";
import { useGetWarehouseArticlesByCategory } from "@/hooks/mantenimiento/almacen/articulos/useGetWarehouseArticlesByCategory";
import { IWarehouseArticle } from "@/hooks/mantenimiento/almacen/articulos/useGetWarehouseArticlesByCategory";
import { useCompanyStore } from "@/stores/CompanyStore";

export interface GlobalSearchState {
  partNumberFilter: string;
  selectedZone: string;
  filtersExpanded: boolean;
}

export interface GlobalSearchActions {
  setPartNumberFilter: (filter: string) => void;
  setSelectedZone: (zone: string) => void;
  setFiltersExpanded: (expanded: boolean) => void;
  clearFilters: () => void;
}

export interface GlobalSearchStats {
  availableZones: string[];
  hasActiveFilters: boolean;
  filteredBatches: IWarehouseArticle[];
  articleCounts: {
    totalArticles: number;
    filteredArticles: number;
  };
  isSearching: boolean;
}

/**
 * Hook que maneja la búsqueda global combinando datos paginados con búsqueda por part_number
 */
export const useGlobalSearch = (paginatedBatches: IWarehouseArticle[] | undefined, allZones: string[] = []) => {
  const { selectedCompany, selectedStation } = useCompanyStore();
  const [partNumberFilter, setPartNumberFilter] = useState<string>("");
  const [selectedZone, setSelectedZone] = useState<string>("all");
  const [filtersExpanded, setFiltersExpanded] = useState<boolean>(false);
  
  // Debounce el filtro de número de parte para mejorar rendimiento
  const debouncedPartNumberFilter = useDebounce(partNumberFilter, 300);

  // Búsqueda global por part_number usando el endpoint con artículos completos
  const { 
    data: searchedBatchesWithArticles, 
    isLoading: isSearching 
  } = useSearchBatchesWithArticles(
    selectedCompany?.slug,
    selectedStation ?? undefined,
    debouncedPartNumberFilter || undefined
  );

  // Transformar BatchWithArticles[] a IWarehouseArticle[]
  const transformedSearchResults = useMemo(() => {
    if (!searchedBatchesWithArticles) return null;
    
    return searchedBatchesWithArticles.map(
      (item: BatchWithArticles): IWarehouseArticle => ({
        batch_id: item.batch.id,
        name: item.batch.name,
        medition_unit: item.batch.medition_unit,
        // category: item.batch.category,
        article_count: item.articles.length,
        articles: item.articles.map((article) => ({
          id: article.id,
          part_number: article.part_number,
          alternative_part_number: article.alternative_part_number ?? undefined,
          serial: article.serial ?? undefined,
          description: article.description || "",
          zone: article.zone,
          quantity: article.quantity,
          status: article.status,
          article_type: article.article_type || "CONSUMABLE",
          condition: { name: article.condition },
          cost: article.cost ?? 0, // <-- ¡Corregido!
        })),
      })
    );
  }, [searchedBatchesWithArticles]);

  // Determinar qué batches usar: paginados o búsqueda global
  const sourceBatches = useMemo(() => {
    // Si hay filtro de part_number, usar resultados de búsqueda transformados
    if (debouncedPartNumberFilter && transformedSearchResults) {
      return transformedSearchResults;
    }
    
    // Si no hay filtro de part_number, usar datos paginados
    return paginatedBatches || [];
  }, [debouncedPartNumberFilter, transformedSearchResults, paginatedBatches]);

  // Obtener zonas únicas disponibles
  const availableZones = useMemo(() => {
    // Si hay zonas del hook de todas las zonas, usarlas
    if (allZones.length > 0) {
      return allZones;
    }
    
    // Si no, extraer de los batches actuales
    if (!sourceBatches) return [];
    const zones: string[] = [];
    sourceBatches.forEach((batch) => {
      batch.articles.forEach((article) => {
        if (!zones.includes(article.zone)) {
          zones.push(article.zone);
        }
      });
    });
    return zones.sort();
  }, [sourceBatches, allZones]);

  // Filtrar batches según los filtros aplicados
  const filteredBatches = useMemo(() => {
    if (!sourceBatches) return [];

    return sourceBatches
      .map((batch) => ({
        ...batch,
        articles: batch.articles.filter((article) => {
          // Filtro por zona
          const zoneMatch =
            selectedZone === "all" || article.zone === selectedZone;

          // Si estamos usando búsqueda global, el filtro de part_number ya se aplicó
          // Si estamos usando datos paginados, aplicar filtro de part_number localmente
          const partNumberMatch = debouncedPartNumberFilter 
            ? true // Ya filtrado por búsqueda global
            : true; // No hay filtro de part_number

          return zoneMatch && partNumberMatch;
        }),
      }))
      .filter((batch) => batch.articles.length > 0);
  }, [sourceBatches, selectedZone, debouncedPartNumberFilter]);

  // Verificar si hay filtros activos
  const hasActiveFilters = useMemo(
    () => selectedZone !== "all" || partNumberFilter !== "",
    [selectedZone, partNumberFilter]
  );

  // Contadores de artículos
  const articleCounts = useMemo(() => {
    const totalArticles =
      sourceBatches?.reduce((count, batch) => count + batch.articles.length, 0) || 0;
    const filteredArticles = filteredBatches.reduce(
      (count, batch) => count + batch.articles.length,
      0
    );
    return { totalArticles, filteredArticles };
  }, [sourceBatches, filteredBatches]);

  // Función para limpiar filtros
  const clearFilters = useCallback(() => {
    setSelectedZone("all");
    setPartNumberFilter("");
  }, []);

  return {
    state: {
      partNumberFilter,
      selectedZone,
      filtersExpanded,
    },
    actions: {
      setPartNumberFilter,
      setSelectedZone,
      setFiltersExpanded,
      clearFilters,
    },
    stats: {
      availableZones,
      hasActiveFilters,
      filteredBatches,
      articleCounts,
      isSearching: isSearching && !!debouncedPartNumberFilter,
    },
  };
};
