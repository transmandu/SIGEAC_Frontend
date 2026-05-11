"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
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
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn, Path, FieldValues } from "react-hook-form";

export interface ComboboxOption {
  value: string | number;
  label: string;
  /** Badge opcional que se muestra junto a la etiqueta */
  badge?: string;
}

interface ComboboxFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  options: ComboboxOption[];
  disabled?: boolean;
  /** Agrega una acción "Registrar nuevo …" al final de la lista */
  onCreateNew?: () => void;
  createNewLabel?: string;
}

/**
 * ComboBox genérico construido sobre shadcn/ui Command + Popover.
 */
export function ComboboxField<T extends FieldValues>({
  form,
  name,
  label,
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  emptyText = "No se encontraron resultados.",
  options,
  disabled = false,
  onCreateNew,
  createNewLabel = "Registrar nuevo",
}: ComboboxFieldProps<T>) {
  const [open, setOpen] = useState(false);

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const selectedOption = options.find(
          (o) => String(o.value) === String(field.value),
        );

        return (
          <FormItem className="flex flex-col">
            <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {label}
            </FormLabel>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    disabled={disabled}
                    className={cn(
                      "w-full justify-between font-normal h-9",
                      !field.value && "text-muted-foreground",
                    )}
                  >
                    {selectedOption ? (
                      <div className="flex items-center gap-2 overflow-hidden flex-1">
                        <span className="truncate">{selectedOption.label}</span>
                        {selectedOption.badge && (
                          <span className="text-[10px] uppercase font-bold text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded shrink-0">
                            {selectedOption.badge}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span>{disabled ? "Cargando..." : placeholder}</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>

              <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                  <CommandInput placeholder={searchPlaceholder} />
                  <CommandList>
                    <CommandEmpty>{emptyText}</CommandEmpty>
                    <CommandGroup>
                      {options.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={String(option.label)}
                          onSelect={() => {
                            form.setValue(name, option.value as any);
                            setOpen(false);
                          }}
                        >
                          <div className="flex flex-1 items-center justify-between gap-2 overflow-hidden">
                            <span className="truncate font-medium">
                              {option.label}
                            </span>
                            {option.badge && (
                              <span className="shrink-0 text-[10px] uppercase font-bold text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded border border-border/50">
                                {option.badge.replace(/_/g, " ")}
                              </span>
                            )}
                          </div>
                          <Check
                            className={cn(
                              "ml-2 h-4 w-4 shrink-0",
                              String(option.value) === String(field.value)
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>

                    {onCreateNew && (
                      <>
                        <CommandSeparator />
                        <CommandGroup>
                          <CommandItem
                            onSelect={() => {
                              onCreateNew();
                              setOpen(false);
                            }}
                            className="flex items-center gap-2 cursor-pointer text-primary font-medium"
                          >
                            <Plus className="h-4 w-4" />
                            {createNewLabel}
                          </CommandItem>
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
