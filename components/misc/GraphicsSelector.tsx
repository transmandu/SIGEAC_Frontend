// components/misc/GraphicsSelector.tsx
"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { useState } from "react";

export interface GraphicsOption {
  id: string;
  label: string;
  description?: string;
}

interface GraphicsSelectorProps {
  options: GraphicsOption[];
  selectedGraphics: string[];
  onSelectionChange: (selected: string[]) => void;
  label?: string;
  placeholder?: string;
  showDescriptions?: boolean;
}

export const GraphicsSelector: React.FC<GraphicsSelectorProps> = ({
  options,
  selectedGraphics,
  onSelectionChange,
  label = "Seleccionar Gráficos a Mostrar:",
  placeholder = "Seleccionar gráficos...",
  showDescriptions = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectChange = (id: string) => {
    const newSelection = selectedGraphics.includes(id)
      ? selectedGraphics.filter((item) => item !== id)
      : [...selectedGraphics, id];

    onSelectionChange(newSelection);
  };

  const removeGraphic = (id: string) => {
    const newSelection = selectedGraphics.filter((item) => item !== id);
    onSelectionChange(newSelection);
  };

  const clearSelection = () => {
    onSelectionChange([]);
  };

  return (
    <div className="flex flex-col space-y-2">
      <Label className="text-lg font-semibold">{label}</Label>
      <div className="flex flex-col md:flex-row gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isOpen}
              className="w-full justify-between"
            >
              {selectedGraphics.length === 0 ? (
                placeholder
              ) : (
                <span>{selectedGraphics.length} gráficos seleccionados</span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command>
              <CommandInput placeholder="Buscar gráficos..." />
              <CommandList>
                <CommandEmpty>No se encontraron gráficos</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.id}
                      value={option.id}
                      onSelect={() => handleSelectChange(option.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedGraphics.includes(option.id)
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {showDescriptions && option.description ? (
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {option.description}
                          </span>
                        </div>
                      ) : (
                        <span>{option.label}</span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Button
          variant="outline"
          onClick={clearSelection}
          disabled={selectedGraphics.length === 0}
        >
          Limpiar selección
        </Button>
      </div>

      {selectedGraphics.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedGraphics.map((graphicId) => {
            const graphic = options.find((g) => g.id === graphicId);
            return (
              <Badge
                key={graphicId}
                variant="outline"
                className="px-3 py-1 text-sm flex items-center gap-2"
              >
                {graphic?.label}
                <button
                  onClick={() => removeGraphic(graphicId)}
                  className="rounded-full p-1 hover:bg-gray-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};
