"use client";

import { Fragment, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

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
import { cn } from "@/lib/utils";

export interface SearchableOption {
  value: string;
  label: string;
  /** Texto secundario (cargo, código…); también entra en la búsqueda. */
  description?: string;
  /** Agrupa las opciones bajo un encabezado. */
  group?: string;
}

interface SearchableSelectProps {
  value?: string;
  onChange: (value: string) => void;
  options: SearchableOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  /** Muestra "Cargando..." en vez del texto de ayuda mientras llegan las opciones. */
  loading?: boolean;
  invalid?: boolean;
  /** Clases del botón (altura, tamaño de texto…). */
  triggerClassName?: string;
  id?: string;
}

/**
 * Selector con búsqueda para listas largas (empleados, agencias, unidades…).
 * Solo elige: los selectores que además dejan crear una entrada nueva
 * (proveedor, comercio…) son componentes propios, porque esa acción depende
 * del permiso del usuario sobre el catálogo.
 */
export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  emptyText = "Sin resultados",
  disabled,
  loading,
  invalid,
  triggerClassName,
  id,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);

  const selected = options.find((option) => option.value === value);

  const groups = Array.from(
    options.reduce((acc, option) => {
      const key = option.group ?? "";
      acc.set(key, [...(acc.get(key) ?? []), option]);
      return acc;
    }, new Map<string, SearchableOption[]>()),
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid || undefined}
          disabled={disabled || loading}
          className={cn(
            "w-full min-w-0 justify-between bg-background/70 font-normal",
            !selected && "text-muted-foreground",
            invalid && "border-destructive/60 ring-1 ring-destructive/30",
            triggerClassName,
          )}
        >
          <span className="min-w-0 truncate">
            {loading ? "Cargando..." : (selected?.label ?? placeholder)}
          </span>
          <ChevronsUpDown className="ml-1 size-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[max(var(--radix-popover-trigger-width),220px)] p-0"
        align="start"
      >
        <Command
          filter={(itemValue, search) =>
            itemValue.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
          }
        >
          <CommandInput placeholder={searchPlaceholder} className="h-9" />

          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>

            {groups.map(([groupName, groupOptions], index) => (
              <Fragment key={groupName}>
                {index > 0 && <CommandSeparator />}
                <CommandGroup heading={groupName || undefined}>
                  {groupOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={`${option.label} ${option.description ?? ""} ${option.value}`}
                      onSelect={() => {
                        onChange(option.value);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 size-4 shrink-0",
                          option.value === value ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate">{option.label}</span>
                        {option.description && (
                          <span className="block truncate text-xs text-muted-foreground">
                            {option.description}
                          </span>
                        )}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Fragment>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
