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

interface SearchableZoneSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  availableZones: string[];
  placeholder?: string;
  className?: string;
}

export const SearchableZoneSelect = React.memo(({
  value,
  onValueChange,
  availableZones,
  placeholder = "Seleccionar zona...",
  className,
}: SearchableZoneSelectProps) => {
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "justify-between h-9",
            !value && "text-muted-foreground",
            className
          )}
          type="button"
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
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
            {filteredZones.length === 0 ? (
              <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                {searchQuery 
                  ? `No se encontraron zonas con "${searchQuery}"`
                  : "No hay zonas disponibles"
                }
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {/* Info de resultados */}
                <div className="px-2 py-1 text-xs text-muted-foreground border-b">
                  {searchQuery 
                    ? `${filteredZones.length} zonas encontradas`
                    : `Mostrando 50 de ${availableZones.length} zonas - use búsqueda para filtrar`
                  }
                </div>
                {filteredZones.map((zone) => (
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
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
});

SearchableZoneSelect.displayName = "SearchableZoneSelect";
