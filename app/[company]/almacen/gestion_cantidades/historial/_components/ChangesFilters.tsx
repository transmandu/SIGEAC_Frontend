import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Filter, X, Search, User, Package } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

export interface FilterState {
  dateRange: { from: Date | null; to: Date | null };
  user: string;
  changeType: string;
  articleFilter: string;
}

interface ChangesFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  totalRecords: number;
  filteredRecords: number;
}

export const ChangesFilters = React.memo(({ 
  filters, 
  onFiltersChange, 
  totalRecords, 
  filteredRecords 
}: ChangesFiltersProps) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      dateRange: { from: null, to: null },
      user: "",
      changeType: "",
      articleFilter: ""
    });
  };

  const hasActiveFilters = Boolean(
    filters.dateRange.from || 
    filters.dateRange.to || 
    filters.user || 
    filters.changeType || 
    filters.articleFilter
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Búsqueda
            {hasActiveFilters && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs ml-2">
                Activos
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Contraer" : "Expandir"}
            </Button>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" />
                Limpiar
              </Button>
            )}
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="text-sm text-muted-foreground">
          Mostrando <span className="font-medium text-foreground">{filteredRecords}</span> de{" "}
          <span className="font-medium text-foreground">{totalRecords}</span> registros
          {hasActiveFilters && (
            <span className="ml-2 text-blue-600">(filtros aplicados)</span>
          )}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                Rango de Fechas
              </Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal flex-1",
                        !filters.dateRange.from && "text-muted-foreground"
                      )}
                    >
                      {filters.dateRange.from ? (
                        format(filters.dateRange.from, "dd/MM/yyyy", { locale: es })
                      ) : (
                        "Desde"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.from || undefined}
                      onSelect={(date) => updateFilter("dateRange", { ...filters.dateRange, from: date || null })}
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal flex-1",
                        !filters.dateRange.to && "text-muted-foreground"
                      )}
                    >
                      {filters.dateRange.to ? (
                        format(filters.dateRange.to, "dd/MM/yyyy", { locale: es })
                      ) : (
                        "Hasta"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.to || undefined}
                      onSelect={(date) => updateFilter("dateRange", { ...filters.dateRange, to: date || null })}
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* User Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
                <User className="h-4 w-4" />
                Usuario
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por nombre..."
                  value={filters.user}
                  onChange={(e) => updateFilter("user", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Change Type Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
                <Package className="h-4 w-4" />
                Tipo de Cambio
              </Label>
              <Select
                value={filters.changeType}
                onValueChange={(value) => updateFilter("changeType", value === "all" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="bulk_update">Actualización Masiva</SelectItem>
                  <SelectItem value="single_update">Actualización Individual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Article Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
                <Package className="h-4 w-4" />
                Artículo
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Part number o descripción..."
                  value={filters.articleFilter}
                  onChange={(e) => updateFilter("articleFilter", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-muted-foreground">Filtros activos:</span>
                
                {filters.dateRange.from && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    Desde: {format(filters.dateRange.from, "dd/MM/yyyy", { locale: es })}
                  </span>
                )}
                
                {filters.dateRange.to && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    Hasta: {format(filters.dateRange.to, "dd/MM/yyyy", { locale: es })}
                  </span>
                )}
                
                {filters.user && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                    Usuario: {filters.user}
                  </span>
                )}
                
                {filters.changeType && (
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                    Tipo: {filters.changeType === "bulk_update" ? "Masiva" : "Individual"}
                  </span>
                )}
                
                {filters.articleFilter && (
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                    Artículo: {filters.articleFilter}
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
});

ChangesFilters.displayName = "ChangesFilters";
