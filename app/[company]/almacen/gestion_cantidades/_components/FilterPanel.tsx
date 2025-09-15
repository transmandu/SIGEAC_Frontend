import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, Filter, Search, X } from "lucide-react";
import { SearchableZoneFilter } from "./SearchableZoneFilter";
import { IWarehouseArticle } from "@/hooks/mantenimiento/almacen/articulos/useGetWarehouseConsumableArticles";

interface FilterPanelProps {
  batches: IWarehouseArticle[] | undefined;
  filterState: {
    selectedZone: string;
    partNumberFilter: string;
    filtersExpanded: boolean;
  };
  filterActions: {
    setSelectedZone: (zone: string) => void;
    setPartNumberFilter: (filter: string) => void;
    setFiltersExpanded: (expanded: boolean) => void;
    clearFilters: () => void;
  };
  stats: {
    availableZones: string[];
    hasActiveFilters: boolean;
    articleCounts: {
      totalArticles: number;
      filteredArticles: number;
    };
  };
}

export const FilterPanel = React.memo(({ 
  batches, 
  filterState, 
  filterActions, 
  stats 
}: FilterPanelProps) => {
  const { selectedZone, partNumberFilter, filtersExpanded } = filterState;
  const { setSelectedZone, setPartNumberFilter, setFiltersExpanded, clearFilters } = filterActions;
  const { availableZones, hasActiveFilters, articleCounts } = stats;

  return (
    <Card className="mb-4 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
            {hasActiveFilters && !filtersExpanded && (
              <div className="flex items-center gap-1 ml-2 transition-all duration-300 ease-in-out">
                {selectedZone !== "all" && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs animate-in fade-in-50 slide-in-from-left-2">
                    {selectedZone}
                  </span>
                )}
                {partNumberFilter && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs animate-in fade-in-50 slide-in-from-left-2">
                    {partNumberFilter}
                  </span>
                )}
              </div>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFiltersExpanded(!filtersExpanded)}
            className="flex items-center gap-1 hover:bg-muted/50 transition-all duration-200"
          >
            <span className="transition-all duration-200">
              {filtersExpanded ? "Contraer" : "Expandir"}
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-300 ease-in-out ${
                filtersExpanded ? "rotate-180" : "rotate-0"
              }`}
            />
          </Button>
        </div>
        {!filtersExpanded && (
          <div className="text-sm text-muted-foreground mt-2 animate-in fade-in-50 slide-in-from-top-2 duration-300">
            Mostrando{" "}
            <span className="font-medium text-foreground">
              {articleCounts.filteredArticles}
            </span>{" "}
            de{" "}
            <span className="font-medium text-foreground">
              {articleCounts.totalArticles}
            </span>{" "}
            artículos
            {hasActiveFilters && (
              <span className="ml-2 text-blue-600">
                (filtros aplicados)
              </span>
            )}
          </div>
        )}
      </CardHeader>

      {/* Contenido de filtros con animación personalizada */}
      <div
        className={`transition-all duration-500 ease-in-out ${
          filtersExpanded
            ? "max-h-96 opacity-100 transform translate-y-0"
            : "max-h-0 opacity-0 transform -translate-y-4"
        }`}
      >
        <CardContent className="space-y-3 pt-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Filtro por Zona */}
            <div
              className={`space-y-2 transition-all duration-300 ease-out ${
                filtersExpanded
                  ? "animate-in fade-in-50 slide-in-from-bottom-2"
                  : ""
              }`}
              style={{ animationDelay: "100ms" }}
            >
              <label className="text-sm font-medium text-muted-foreground">
                Zona de Almacén
              </label>
              <SearchableZoneFilter
                value={selectedZone}
                onValueChange={setSelectedZone}
                availableZones={availableZones}
              />
            </div>

            {/* Filtro por Número de Parte */}
            <div
              className={`space-y-2 transition-all duration-300 ease-out ${
                filtersExpanded
                  ? "animate-in fade-in-50 slide-in-from-bottom-2"
                  : ""
              }`}
              style={{ animationDelay: "200ms" }}
            >
              <label className="text-sm font-medium text-muted-foreground">
                Número de Parte
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 transition-colors duration-200" />
                <Input
                  placeholder="Buscar por número de parte..."
                  value={partNumberFilter}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPartNumberFilter(e.target.value)
                  }
                  className="pl-10 transition-all duration-200 hover:border-primary/50 focus:border-primary"
                />
              </div>
            </div>

            {/* Botón Limpiar Filtros */}
            <div
              className={`space-y-2 transition-all duration-300 ease-out ${
                filtersExpanded
                  ? "animate-in fade-in-50 slide-in-from-bottom-2"
                  : ""
              }`}
              style={{ animationDelay: "300ms" }}
            >
              <label className="text-sm font-medium text-muted-foreground">
                Acciones
              </label>
              <Button
                variant="outline"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="w-full flex items-center gap-2 transition-all duration-200 hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
                Limpiar Filtros
              </Button>
            </div>
          </div>

          {/* Resumen de filtros */}
          <div
            className={`flex items-center justify-between pt-2 border-t transition-all duration-300 ease-out ${
              filtersExpanded
                ? "animate-in fade-in-50 slide-in-from-bottom-2"
                : ""
            }`}
            style={{ animationDelay: "400ms" }}
          >
            <div className="text-sm text-muted-foreground">
              Mostrando{" "}
              <span className="font-medium text-foreground transition-all duration-200">
                {articleCounts.filteredArticles}
              </span>{" "}
              de{" "}
              <span className="font-medium text-foreground">
                {articleCounts.totalArticles}
              </span>{" "}
              artículos
              {hasActiveFilters && (
                <span className="ml-2 text-blue-600 animate-in fade-in-50 duration-300">
                  (filtros aplicados)
                </span>
              )}
            </div>
            {hasActiveFilters && (
              <div className="flex items-center gap-2 text-sm">
                {selectedZone !== "all" && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs transition-all duration-200 hover:bg-blue-200 animate-in fade-in-50 slide-in-from-right-2">
                    Zona: {selectedZone}
                  </span>
                )}
                {partNumberFilter && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs transition-all duration-200 hover:bg-green-200 animate-in fade-in-50 slide-in-from-right-2">
                    Parte: {partNumberFilter}
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
});

FilterPanel.displayName = "FilterPanel";
