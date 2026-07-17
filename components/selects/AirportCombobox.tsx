"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Airport } from "@/types";
import { useAirports } from "@/hooks/general/aeropuertos/useAirports";
import { cn } from "@/lib/utils";

/** Un código IATA (3 letras) o ICAO (4 letras), sin acentos ni números. */
export const AIRPORT_CODE_REGEX = /^[A-Za-z]{3,4}$/;

interface AirportComboboxProps {
  value: string | null | undefined;
  onChange: (code: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

const MAX_RESULTS = 50;

type AirportMatch = {
  airport: Airport;
  /** Código (IATA o ICAO) que coincidió con la búsqueda del usuario; es el que se guarda al seleccionar. */
  matchedCode: string;
};

function matchAirport(airport: Airport, term: string): AirportMatch | null {
  if (!term) return { airport, matchedCode: airport.iata };

  if (airport.iata.toLowerCase().includes(term)) {
    return { airport, matchedCode: airport.iata };
  }
  if (airport.icao.toLowerCase().includes(term)) {
    return { airport, matchedCode: airport.icao };
  }
  if (
    airport.city.toLowerCase().includes(term) ||
    airport.name.toLowerCase().includes(term)
  ) {
    return { airport, matchedCode: airport.iata };
  }
  return null;
}

export function AirportCombobox({
  value,
  onChange,
  placeholder = "Seleccionar aeropuerto...",
  disabled,
}: AirportComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: airports, isLoading, isError } = useAirports();

  const results = useMemo(() => {
    if (!airports) return [];

    const term = search.trim().toLowerCase();
    const matches: AirportMatch[] = [];

    for (const airport of airports) {
      const match = matchAirport(airport, term);
      if (match) matches.push(match);
      if (matches.length >= MAX_RESULTS) break;
    }

    return matches;
  }, [airports, search]);

  const customCode = useMemo(() => {
    const term = search.trim().toUpperCase();
    if (!AIRPORT_CODE_REGEX.test(term)) return null;
    if (results.some((r) => r.matchedCode.toUpperCase() === term)) return null;
    return term;
  }, [search, results]);

  const selectCode = (code: string | null) => {
    onChange(code === value ? null : code);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSearch("");
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          disabled={isLoading || isError || disabled}
          className={cn(
            "h-8 w-full justify-between px-2 text-sm font-normal",
            !value && "text-muted-foreground"
          )}
        >
          {isLoading && <Loader2 className="size-3.5 shrink-0 animate-spin" />}
          <span className="truncate">{value || placeholder}</span>
          <ChevronsUpDown className="ml-auto size-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[320px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar por código, ciudad o nombre..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty className="p-2 text-center text-xs text-muted-foreground">
              Ningún aeropuerto del catálogo coincide. Ingrese un código IATA
              (3 letras) o ICAO (4 letras) para usarlo igualmente.
            </CommandEmpty>
            <CommandGroup>
              {results.map(({ airport, matchedCode }) => (
                <CommandItem
                  key={airport.iata}
                  value={airport.iata}
                  onSelect={() => selectCode(matchedCode)}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4 shrink-0",
                      matchedCode === value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="flex flex-col">
                    <span className="text-sm font-medium">
                      {airport.iata !== airport.icao && matchedCode === airport.icao
                        ? `${airport.icao} (${airport.iata})`
                        : airport.iata}
                      {airport.city ? ` — ${airport.city}` : ""}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {airport.name} ({airport.country})
                    </span>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>

            {customCode && (
              <CommandGroup heading="No está en el catálogo">
                <CommandItem
                  value={`custom-${customCode}`}
                  onSelect={() => selectCode(customCode)}
                >
                  <Plus className="mr-2 size-4 shrink-0" />
                  <span className="text-sm">
                    Usar código <span className="font-medium">{customCode}</span>
                  </span>
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
