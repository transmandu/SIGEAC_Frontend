import React, { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SearchableZoneFilterProps {
  value: string;
  onValueChange: (value: string) => void;
  availableZones: string[];
}

export const SearchableZoneFilter = React.memo(({
  value,
  onValueChange,
  availableZones,
}: SearchableZoneFilterProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filtrar zonas basado en la búsqueda
  const filteredZones = useMemo(() => {
    if (!searchQuery) {
      return availableZones.slice(0, 50); // Mostrar solo las primeras 50 inicialmente
    }
    
    return availableZones.filter((zone) =>
      zone.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availableZones, searchQuery]);

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    setOpen(false);
    setSearchQuery(""); // Limpiar búsqueda al seleccionar
  };

  const getDisplayValue = () => {
    if (value === "all") return "Todas las zonas";
    return value || "Todas las zonas";
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between transition-all duration-200 hover:border-primary/50"
          type="button"
        >
          {getDisplayValue()}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="Buscar zona..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandList className="max-h-[200px]">
            <CommandGroup>
              {/* Opción "Todas las zonas" siempre visible */}
              <CommandItem
                value="all"
                onSelect={() => handleSelect("all")}
                className="cursor-pointer font-medium"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === "all" ? "opacity-100" : "opacity-0"
                  )}
                />
                Todas las zonas
              </CommandItem>
              
              {/* Separador visual */}
              <div className="h-px bg-border mx-2 my-1" />
              
              {/* Info de resultados */}
              <div className="px-2 py-1 text-xs text-muted-foreground">
                {searchQuery 
                  ? `${filteredZones.length} zonas encontradas`
                  : `Mostrando 50 de ${availableZones.length} zonas - use búsqueda para filtrar`
                }
              </div>
              
              {filteredZones.length === 0 && searchQuery ? (
                <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                  No se encontraron zonas con {searchQuery}
                </CommandEmpty>
              ) : (
                filteredZones.map((zone) => (
                  <CommandItem
                    key={zone}
                    value={zone}
                    onSelect={() => handleSelect(zone)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === zone ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {zone}
                  </CommandItem>
                ))
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
});

SearchableZoneFilter.displayName = "SearchableZoneFilter";
