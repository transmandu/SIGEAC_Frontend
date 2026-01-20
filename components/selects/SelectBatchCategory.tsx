"use client";

import { useState, useMemo } from "react";
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
import { Search, ChevronsUpDown, Check, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetBatchesByCategory } from "@/hooks/mantenimiento/almacen/renglones/useGetBatchesByCategory";
import { Batch } from "@/types";

interface IRegisterArticleProps {
  isEditing?: boolean;
  initialData?: Batch;
  category?: string;
  onBatchSelect?: (batch: Batch | null) => void;
  onEditBatch?: (batch: Batch) => void; // Nueva prop para editar
}

const SelectBatchCategory = ({
  isEditing = false,
  initialData,
  onBatchSelect,
  onEditBatch, // Nueva prop
}: IRegisterArticleProps) => {
  const [type, setType] = useState(
    initialData?.category.toUpperCase() ?? "COMPONENT"
  );
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(
    initialData || null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);

  const {
    data: batches,
    isPending: isBatchesLoading,
    isError: isBatchesError,
  } = useGetBatchesByCategory(type.toUpperCase());

  const filteredBatches = useMemo(() => {
    if (!batches) return [];
    if (!searchTerm.trim()) return batches;

    const term = searchTerm.toLowerCase().trim();
    return batches.filter((batch: Batch) => {
      const name = batch.name?.toLowerCase() || "";
      const description = batch.description?.toLowerCase() || "";
      const id = batch.id?.toString() || "";

      return (
        name.includes(term) || description.includes(term) || id.includes(term)
      );
    });
  }, [batches, searchTerm]);

  const getBatchLabel = (batch: Batch) => {
    return batch.name || batch.description || `Batch ${batch.id}`;
  };

  const handleTypeSelect = (data: string) => {
    setType(data);
    setSelectedBatch(null);
    setSearchTerm("");
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
    if (onBatchSelect) onBatchSelect(null);
  };

  const handleEditBatch = () => {
    if (selectedBatch && onEditBatch) {
      onEditBatch(selectedBatch);
    }
  };

  return (
    <div className="flex gap-4 items-center justify-center w-full">
      {/* Selector de categoría */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Categoría</label>
        <Select value={type} onValueChange={handleTypeSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccionar categoría..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CONSUMABLE">Consumible</SelectItem>
            <SelectItem value="TOOL">Herramienta</SelectItem>
            <SelectItem value="COMPONENT">Componente</SelectItem>
            <SelectItem value="PART">Parte</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Selector de batches con buscador (usando Popover) */}
      {type && (
        <div className="space-y-2 flex-1">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Seleccionar Batch</label>
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
                aria-expanded={open}
                className="w-full justify-between overflow-auto"
                disabled={
                  isBatchesLoading || isBatchesError || !batches?.length
                }
              >
                <span className="truncate">
                  {selectedBatch
                    ? getBatchLabel(selectedBatch)
                    : isBatchesLoading
                      ? "Cargando batches..."
                      : isBatchesError
                        ? "Error al cargar"
                        : !batches?.length
                          ? "No hay batches disponibles"
                          : "Seleccionar batch..."}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[400px] p-0">
              <div className="p-2 border-b">
                <div className="flex items-center px-2">
                  <Search className="mr-2 h-4 w-4 shrink-0 text-gray-500" />
                  <Input
                    placeholder="Buscar batch..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>

              <div className="max-h-[300px] overflow-y-auto">
                {isBatchesLoading ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    Cargando...
                  </div>
                ) : isBatchesError ? (
                  <div className="p-4 text-center text-sm text-red-500">
                    Error al cargar batches
                  </div>
                ) : (
                  <>
                    {filteredBatches.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        {searchTerm
                          ? "No se encontraron batches"
                          : "No hay batches disponibles"}
                      </div>
                    ) : (
                      <>
                        <div className="px-3 py-2 text-xs text-gray-500 border-b">
                          {filteredBatches.length} resultado(s)
                          {searchTerm && ` para "${searchTerm}"`}
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
                                  : "opacity-0"
                              )}
                            />
                          </div>
                        ))}
                      </>
                    )}
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
