"use client";

import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

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
import { triggerButtonClass } from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { cn } from "@/lib/utils";

/**
 * Combobox con buscador, igual a SearchableSelect (IdentificationSection)
 * pero sin el `FormControl` que la envuelve ahí — ese depende de
 * `useFormContext()`, que revienta ("Cannot destructure ... of useFormContext
 * as it is null") apenas se usa fuera de un <Form> de react-hook-form. Este
 * es para selects sueltos (diálogos con estado propio, filtros de listado).
 */
export function SearchableCombobox<T extends { id: number | string; name: string }>({
  options,
  value,
  onSelect,
  placeholder,
  searchPlaceholder,
  emptyLabel,
  loading,
  disabled,
  renderLabel,
}: {
  options?: T[];
  value?: string;
  onSelect: (option: T) => void;
  placeholder: string;
  searchPlaceholder: string;
  emptyLabel: string;
  loading?: boolean;
  disabled?: boolean;
  renderLabel?: (option: T) => React.ReactNode;
}) {
  const selected = options?.find((option) => `${option.id}` === value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          disabled={disabled}
          variant="outline"
          role="combobox"
          className={cn(triggerButtonClass, !value && "text-muted-foreground")}
        >
          {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
          <span className="truncate">{selected ? selected.name : placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        matchTriggerWidth
        align="start"
        sideOffset={6}
        className="overflow-hidden rounded-xl border-slate-400/60 p-0 shadow-lg dark:border-slate-600/60"
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty className="p-2 text-center text-xs">{emptyLabel}</CommandEmpty>
            <CommandGroup>
              {options?.map((option) => (
                <CommandItem key={option.id} value={option.name} onSelect={() => onSelect(option)}>
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      `${option.id}` === value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="min-w-0 flex-1 truncate">
                    {renderLabel ? renderLabel(option) : option.name}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
