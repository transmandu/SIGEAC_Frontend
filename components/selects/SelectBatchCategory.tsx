"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ChevronsUpDown, Check, Edit, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetBatchesByCategory } from "@/hooks/mantenimiento/almacen/renglones/useGetBatchesByCategory";
// Importa el nuevo hook (ajusta la ruta según tu proyecto)
import { Batch } from "@/types";
import { useSearchBatchesByPartNumber } from "@/hooks/mantenimiento/almacen/renglones/useGetBatchesByArticlePartNumber";
import { useCompanyStore } from "@/stores/CompanyStore";

interface IRegisterArticleProps {
  isEditing?: boolean;
  initialData?: Batch;
  category?: string;
  onBatchSelect?: (batch: Batch | null) => void;
  onEditBatch?: (batch: Batch) => void;
}

const SelectBatchCategory = ({
  isEditing = false,
  initialData,
  onBatchSelect,
  onEditBatch,
}: IRegisterArticleProps) => {
  const { selectedCompany, selectedStation } = useCompanyStore();
  const [type, setType] = useState(
    initialData?.category.toUpperCase() ?? "",
  );

  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(
    initialData || null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [partNumberToSearch, setPartNumberToSearch] = useState(""); // Nuevo estado
  const [open, setOpen] = useState(false);

  // Hook 1: Batches por Categoría (General)
  const {
    data: batches,
    isPending: isBatchesLoading,
    isError: isBatchesError,
  } = useGetBatchesByCategory(type.toUpperCase());

  // Hook 2: Búsqueda por Part Number
  const { data: searchResults, isFetching: isSearching } =
    useSearchBatchesByPartNumber(
      selectedCompany?.slug || "",
      selectedStation || undefined,
      partNumberToSearch,
      type, // Usamos la categoría seleccionada
    );

  // Lógica para decidir qué lista mostrar
  const displayBatches = useMemo(() => {
    // Si hay un Part Number, priorizamos los resultados de búsqueda
    if (partNumberToSearch.trim().length > 0) {
      return searchResults || [];
    }
    return batches || [];
  }, [batches, searchResults, partNumberToSearch]);

  const filteredBatches = useMemo(() => {
    if (!displayBatches) return [];
    if (!searchTerm.trim()) return displayBatches;

    const term = searchTerm.toLowerCase().trim();
    return displayBatches.filter((batch: Batch) => {
      const name = batch.name?.toLowerCase() || "";
      const description = batch.description?.toLowerCase() || "";
      const id = batch.id?.toString() || "";

      return (
        name.includes(term) || description.includes(term) || id.includes(term)
      );
    });
  }, [displayBatches, searchTerm]);

  const getBatchLabel = (batch: Batch) => {
    return batch.name || batch.description || `Batch ${batch.id}`;
  };

  const handleTypeSelect = (data: string) => {
    setType(data);
    setSelectedBatch(null);
    setSearchTerm("");
    setPartNumberToSearch(""); // Limpiamos la búsqueda al cambiar categoría
    setOpen(false);
    if (onBatchSelect) onBatchSelect(null);
  };

  const handleBatchSelect = (batch: Batch) => {
    setSelectedBatch(batch);
    setOpen(false);
    setSearchTerm("");
    if (onBatchSelect) onBatchSelect(batch);
  };

  const handleClearSelection = () => {
    setSelectedBatch(null);
    setPartNumberToSearch("");
    if (onBatchSelect) onBatchSelect(null);
  };

  const handleEditBatch = () => {
    if (selectedBatch && onEditBatch) {
      onEditBatch(selectedBatch);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex gap-4 items-end w-full">
        {/* Selector de categoría */}
        <div className="space-y-2 w-1/3">
          <label className="text-sm font-medium">Categoría</label>
          <Select value={type} onValueChange={handleTypeSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Categoría..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CONSUMABLE">CONSUMIBLE</SelectItem>
              <SelectItem value="TOOL">HERRAMIENTA</SelectItem>
              <SelectItem value="COMPONENT">COMPONENTE</SelectItem>
              <SelectItem value="PART">PARTE</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Nuevo Input de Part Number */}
        <div className="space-y-2 flex-1">
          <label className="text-sm font-medium">Buscar por P/N</label>
          <div className="relative">
            <Input
              placeholder="Ingrese número de parte..."
              value={partNumberToSearch}
              onChange={(e) => setPartNumberToSearch(e.target.value)}
              className="pr-8"
            />
            {isSearching && (
              <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      {/* Selector de batches */}
      {type && (
        <div className="space-y-2 w-full">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">
              {partNumberToSearch ? "Resultados de P/N" : "Seleccionar Batch"}
            </label>
            <div className="flex gap-2">
              {selectedBatch && onEditBatch && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleEditBatch}
                  className="h-6 px-2 text-xs flex items-center gap-1"
                >
                  <Edit className="h-3 w-3" />
                  Editar
                </Button>
              )}
              {selectedBatch && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSelection}
                  className="h-6 px-2 text-xs"
                >
                  Limpiar
                </Button>
              )}
            </div>
          </div>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between overflow-auto"
                disabled={isBatchesLoading || !displayBatches?.length}
              >
                <span className="truncate">
                  {selectedBatch
                    ? getBatchLabel(selectedBatch)
                    : isBatchesLoading || isSearching
                      ? "Buscando..."
                      : !displayBatches?.length
                        ? "No se encontraron resultados"
                        : "Seleccionar batch..."}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[400px] p-0" align="start">
              <div className="p-2 border-b">
                <div className="flex items-center px-2">
                  <Search className="mr-2 h-4 w-4 shrink-0 text-gray-500" />
                  <Input
                    placeholder="Filtrar resultados..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>

              <div className="max-h-[300px] overflow-y-auto">
                {filteredBatches.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No hay batches que coincidan.
                  </div>
                ) : (
                  <>
                    <div className="px-3 py-2 text-xs text-gray-500 border-b bg-slate-50">
                      {partNumberToSearch
                        ? `Resultados para P/N: ${partNumberToSearch}`
                        : `Mostrando todos los de la categoría ${type}`}
                    </div>
                    {filteredBatches.map((batch: Batch) => (
                      <div
                        key={batch.id}
                        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-50"
                        onClick={() => handleBatchSelect(batch)}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {getBatchLabel(batch)}
                          </span>
                          {batch.description && (
                            <span className="text-xs text-gray-500 truncate">
                              {batch.description}
                            </span>
                          )}
                        </div>
                        <Check
                          className={cn(
                            "h-4 w-4",
                            selectedBatch?.id === batch.id
                              ? "opacity-100 text-blue-600"
                              : "opacity-0",
                          )}
                        />
                      </div>
                    ))}
                  </>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
};

export default SelectBatchCategory;
