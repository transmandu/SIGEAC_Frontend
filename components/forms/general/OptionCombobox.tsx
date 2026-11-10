"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";

import { triggerButtonClass } from "@/components/forms/mantenimiento/almacen/_components/form-theme";
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
import { cn } from "@/lib/utils";

export interface ComboOption {
  id: string;
  label: string;
}

/**
 * Selector con búsqueda para elegir un registro de otra tabla (cargo,
 * departamento, ubicación…). Con `onCreate` ofrece, arriba de la lista, la
 * acción de crear uno nuevo sin salir del formulario.
 */
export function OptionCombobox({
  value,
  onChange,
  options,
  placeholder = "Seleccione...",
  searchPlaceholder = "Buscar...",
  emptyText = "Sin resultados",
  loading,
  disabled,
  invalid,
  createLabel,
  onCreate,
}: {
  value: string;
  onChange: (value: string) => void;
  options: ComboOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  loading?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  createLabel?: string;
  onCreate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid || undefined}
          disabled={disabled}
          className={cn(
            triggerButtonClass,
            "min-w-0 max-sm:text-base",
            !selected && "text-muted-foreground",
          )}
        >
          <span className="min-w-0 truncate">
            {loading ? "Cargando..." : (selected?.label ?? placeholder)}
          </span>
          {loading ? (
            <Loader2 className="ml-1 size-3.5 shrink-0 animate-spin opacity-50" />
          ) : (
            <ChevronsUpDown className="ml-1 size-3.5 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[max(var(--radix-popover-trigger-width),240px)] p-0"
        align="start"
      >
        <Command
          // Se busca por el texto visible (keywords); el valor es el id, que no
          // se repite aunque dos opciones tengan el mismo nombre.
          filter={(_value, search, keywords) =>
            (keywords ?? [])
              .join(" ")
              .toLowerCase()
              .includes(search.toLowerCase())
              ? 1
              : 0
          }
        >
          <CommandInput
            placeholder={searchPlaceholder}
            className="h-10 max-sm:text-base"
          />

          {onCreate && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onCreate();
              }}
              className="flex w-full items-center gap-2 border-b px-3 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 max-sm:py-3 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
            >
              <Plus className="size-4" />
              {createLabel ?? "Crear nuevo"}
            </button>
          )}

          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.id}
                  className="max-sm:py-3"
                  value={option.id}
                  keywords={[option.label]}
                  onSelect={() => {
                    onChange(option.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4 shrink-0",
                      option.id === value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="min-w-0 truncate">{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
