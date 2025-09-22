import { useCallback, useMemo, useState, useEffect } from "react";
import { IWarehouseArticle } from "@/hooks/mantenimiento/almacen/articulos/useGetWarehouseConsumableArticles";
import { useDebounce } from "@/lib/useDebounce";

export interface FilterState {
  selectedZone: string;
  partNumberFilter: string;
  filtersExpanded: boolean;
}

export interface FilterActions {
  setSelectedZone: (zone: string) => void;
  setPartNumberFilter: (filter: string) => void;
  setFiltersExpanded: (expanded: boolean) => void;
  clearFilters: () => void;
}

export interface FilterStats {
  availableZones: string[];
  hasActiveFilters: boolean;
  filteredBatches: IWarehouseArticle[];
  articleCounts: {
    totalArticles: number;
    filteredArticles: number;
  };
}

// Component prop types  
export interface BaseArticleProps {
  article: IWarehouseArticle["articles"][0];
  quantity: number;
  zone: string;
  justification: string;
  meditionUnit: string;
  availableZones: string[];
}

export interface ArticleChangeHandlers {
  onQuantityChange: (articleId: number, newQuantity: string) => void;
  onZoneChange: (articleId: number, newZone: string) => void;
  onJustificationChange: (articleId: number, justification: string) => void;
}

export const useFilters = (batches: IWarehouseArticle[] | undefined) => {
  const [selectedZone, setSelectedZone] = useState<string>("all");
  const [partNumberFilter, setPartNumberFilter] = useState<string>("");
  const [filtersExpanded, setFiltersExpanded] = useState<boolean>(false);
  
  // Debounce el filtro de número de parte para mejorar rendimiento
  const debouncedPartNumberFilter = useDebounce(partNumberFilter, 300);


  // Obtener zonas únicas para el filtro
  const availableZones = useMemo(() => {
    if (!batches?.length) return [];
    const zones = new Set<string>();
    batches.forEach((batch) => {
      batch.articles?.forEach((article) => {
        if (article.zone) zones.add(article.zone);
      });
    });
    return Array.from(zones).sort();
  }, [batches]);

  // Filtrar batches según los filtros aplicados
  const filteredBatches = useMemo(() => {
    if (!batches) return [];

    return batches
      .map((batch) => ({
        ...batch,
        articles: batch.articles.filter((article) => {
          // Filtro por zona
          const zoneMatch =
            selectedZone === "all" || article.zone === selectedZone;

          // Filtro por número de parte (búsqueda parcial, case insensitive)
          const partNumberMatch =
            debouncedPartNumberFilter === "" ||
            article.part_number
              .toLowerCase()
              .includes(debouncedPartNumberFilter.toLowerCase());

          return zoneMatch && partNumberMatch;
        }),
      }))
      .filter((batch) => batch.articles.length > 0);
  }, [batches, selectedZone, debouncedPartNumberFilter]);


  // Verificar si hay filtros activos
  const hasActiveFilters = useMemo(
    () => selectedZone !== "all" || partNumberFilter !== "",
    [selectedZone, partNumberFilter]
  );

  // Contadores de artículos
  const articleCounts = useMemo(() => {
    const totalArticles =
      batches?.reduce((count, batch) => count + batch.articles.length, 0) || 0;
    const filteredArticles = filteredBatches.reduce(
      (count, batch) => count + batch.articles.length,
      0
    );
    return { totalArticles, filteredArticles };
  }, [batches, filteredBatches]);

  // Función para limpiar filtros
  const clearFilters = useCallback(() => {
    setSelectedZone("all");
    setPartNumberFilter("");
  }, []);

  return {
    state: {
      selectedZone,
      partNumberFilter,
      filtersExpanded,
    },
    actions: {
      setSelectedZone,
      setPartNumberFilter,
      setFiltersExpanded,
      clearFilters,
    },
    stats: {
      availableZones,
      hasActiveFilters,
      filteredBatches,
      articleCounts,
    },
  };
};
