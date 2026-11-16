"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RequiredIndicator } from "@/components/misc/RequiredIndicator";

export interface MultiSelectOption<T extends string | number> {
  value: T;
  label: string;
  badge?: string;
}

interface MultiSelectComboboxProps<T extends string | number> {
  options: MultiSelectOption<T>[];
  value: T[];
  onChange: (value: T[]) => void;
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

/**
 * Selección múltiple compacta: el trigger muestra un resumen y el listado
 * completo vive dentro de un popover con búsqueda. No cierra el popover al
 * marcar para poder elegir varias opciones seguidas.
 */
export function MultiSelectCombobox<T extends string | number>({
  options,
  value,
  onChange,
  label,
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  emptyText = "No se encontraron resultados.",
  disabled = false,
  required = false,
  className,
}: MultiSelectComboboxProps<T>) {
  const [open, setOpen] = useState(false);

  const selected = options.filter((option) => value.includes(option.value));

  const toggle = (optionValue: T) => {
    onChange(
      value.includes(optionValue)
        ? value.filter((item) => item !== optionValue)
        : [...value, optionValue],
    );
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label ? (
        <label className="flex items-center gap-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
          <RequiredIndicator show={required} />
        </label>
      ) : null}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "h-9 w-full justify-between font-normal",
              selected.length === 0 && "text-muted-foreground",
            )}
          >
            <span className="truncate">
              {selected.length === 0
                ? disabled
                  ? "Cargando..."
                  : placeholder
                : selected.length === 1
                  ? selected[0].label
                  : `${selected.length} seleccionados`}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] min-w-64 p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = value.includes(option.value);

                  return (
                    <CommandItem
                      key={String(option.value)}
                      value={`${option.label} ${option.value}`}
                      onSelect={() => toggle(option.value)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 shrink-0",
                          isSelected ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <span className="flex-1 truncate">{option.label}</span>
                      {option.badge ? (
                        <Badge
                          variant="outline"
                          className="ml-2 shrink-0 text-[10px] uppercase"
                        >
                          {option.badge}
                        </Badge>
                      ) : null}
                    </CommandItem>
                  );
                })}
              </CommandGroup>

              {value.length > 0 ? (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      value="__clear__"
                      onSelect={() => onChange([])}
                      className="justify-center text-xs text-muted-foreground"
                    >
                      Limpiar selección
                    </CommandItem>
                  </CommandGroup>
                </>
              ) : null}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
