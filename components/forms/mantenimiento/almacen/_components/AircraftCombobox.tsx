"use client";

import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FormControl } from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { AeronauticalAircraft } from "@/types";

/**
 * Selector de aeronave con buscador, para el campo `aircraft_id` de los
 * formularios de salida. Todo gira en torno a la matrícula, que es única: es lo
 * que se muestra y lo único por lo que se busca.
 *
 * Va dentro de un `FormField`: envuelve su botón en `FormControl`.
 */
export function AircraftCombobox({
  aircrafts,
  value,
  onChange,
  loading,
}: {
  aircrafts?: AeronauticalAircraft[];
  value?: string;
  onChange: (aircraftId: string) => void;
  loading?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const options = useMemo(
    () =>
      [...(aircrafts ?? [])].sort((a, b) =>
        a.acronym.localeCompare(b.acronym, undefined, { numeric: true }),
      ),
    [aircrafts],
  );

  const selected = options.find((a) => `${a.id}` === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={loading}
            className={cn(
              "h-10 w-full justify-between font-normal",
              !selected && "text-muted-foreground",
            )}
          >
            <span className="truncate">
              {selected ? selected.acronym : "Seleccione una aeronave..."}
            </span>
            {loading ? (
              <Loader2 className="ml-2 size-4 shrink-0 animate-spin" />
            ) : (
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </FormControl>
      </PopoverTrigger>

      <PopoverContent className="p-0" align="start" matchTriggerWidth>
        <Command>
          <CommandInput placeholder="Buscar matrícula..." />
          <CommandList>
            <CommandEmpty>No se encontraron matrículas.</CommandEmpty>
            <CommandGroup>
              {options.map((a) => (
                <CommandItem
                  key={a.id}
                  value={a.acronym}
                  onSelect={() => {
                    onChange(`${a.id}`);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      `${a.id}` === value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="truncate">{a.acronym}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
