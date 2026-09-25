import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, Filter, Search, X } from "lucide-react";
import { SearchableZoneFilter } from "./SearchableZoneFilter";

interface FilterPanelProps {
  filterState: {
    selectedZone: string;
    search: string;
    filtersExpanded: boolean;
  };
  filterActions: {
    setSelectedZone: (zone: string) => void;
    setSearch: (value: string) => void;
    setFiltersExpanded: (expanded: boolean) => void;
    clearFilters: () => void;
  };
  availableZones: string[];
  /** Resumen del servidor (renglones bajo los filtros vigentes). */
  summary?: string;
}

/**
 * Filtros del ajuste de cantidades. Solo capturan: la búsqueda y la zona se
 * resuelven en el servidor, porque el cliente tiene solo la página actual.
 */
export const FilterPanel = React.memo(
  ({
    filterState,
    filterActions,
    availableZones,
    summary,
  }: FilterPanelProps) => {
    const { selectedZone, search, filtersExpanded } = filterState;
    const { setSelectedZone, setSearch, setFiltersExpanded, clearFilters } =
      filterActions;
    const hasActiveFilters = selectedZone !== "all" || search.trim() !== "";

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
                  {search && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs animate-in fade-in-50 slide-in-from-left-2">
                      {search}
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
          {!filtersExpanded && summary && (
            <div className="text-sm text-muted-foreground mt-2 animate-in fade-in-50 slide-in-from-top-2 duration-300">
              {summary}
              {hasActiveFilters && (
                <span className="ml-2 text-blue-600">(filtros aplicados)</span>
              )}
            </div>
          )}
        </CardHeader>

        <div
          className={`transition-all duration-500 ease-in-out ${
            filtersExpanded
              ? "max-h-96 opacity-100 transform translate-y-0"
              : "max-h-0 opacity-0 transform -translate-y-4"
          }`}
        >
          <CardContent className="space-y-3 pt-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Zona de Almacén
                </label>
                <SearchableZoneFilter
                  value={selectedZone}
                  onValueChange={setSelectedZone}
                  availableZones={availableZones}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Número de Parte
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 transition-colors duration-200" />
                  <Input
                    placeholder="Número de parte, serial, lote o descripción..."
                    value={search}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSearch(e.target.value)
                    }
                    className="pl-10 transition-all duration-200 hover:border-primary/50 focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Acciones
                </label>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                  className="w-full flex items-center gap-2 transition-all duration-200 hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="h-4 w-4" />
                  Limpiar Filtros
                </Button>
              </div>
            </div>

            {summary && (
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="text-sm text-muted-foreground">
                  {summary}
                  {hasActiveFilters && (
                    <span className="ml-2 text-blue-600">
                      (filtros aplicados)
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </div>
      </Card>
    );
  },
);

FilterPanel.displayName = "FilterPanel";
