"use client";

import { CheckIcon, ListFilter, ListRestart } from "lucide-react";
import type { Column } from "@tanstack/react-table";

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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

export interface FilterOption {
  label: string;
  value: string;
  description?: string;
}

export interface FilterGroup<TData> {
  /** Etiqueta del grupo dentro del popover. */
  title: string;
  column?: Column<TData, unknown>;
  options: FilterOption[];
}

interface DataTableFilterPopoverProps<TData> {
  groups: FilterGroup<TData>[];
  className?: string;
}

/**
 * Un único disparador para todos los filtros de la tabla: cada grupo es una
 * sección del mismo popover, en vez de un botón por columna.
 */
export function DataTableFilterPopover<TData>({
  groups,
  className,
}: DataTableFilterPopoverProps<TData>) {
  const active = groups.reduce(
    (total, group) => total + ((group.column?.getFilterValue() as string[])?.length ?? 0),
    0,
  );

  const clearAll = () => groups.forEach((group) => group.column?.setFilterValue(undefined));

  const toggle = (group: FilterGroup<TData>, value: string) => {
    const selected = new Set((group.column?.getFilterValue() as string[]) ?? []);
    if (selected.has(value)) {
      selected.delete(value);
    } else {
      selected.add(value);
    }
    const next = Array.from(selected);
    group.column?.setFilterValue(next.length ? next : undefined);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            // Misma base visual que ActionTriggerButton (sin el brillo del cursor).
            "relative h-10 rounded-md px-4 border-border bg-background",
            "text-foreground font-medium shadow-sm transition-all duration-200",
            "hover:bg-transparent hover:border-primary/40 hover:text-primary hover:shadow-md",
            "hover:-translate-y-[1px] active:translate-y-0 active:shadow-sm",
            "focus-visible:ring-2 focus-visible:ring-primary/20",
            active > 0 && "border-primary/40 text-primary",
            className,
          )}
        >
          <ListFilter className="mr-2 size-4" />
          Filtros
          {active > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge variant="secondary" className="rounded-sm px-1.5 font-normal">
                {active}
              </Badge>
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[19rem] p-0" align="center">
        <Command>
          <CommandInput placeholder="Buscar opción..." />
          <CommandList className="max-h-[22rem]">
            <CommandEmpty>Sin coincidencias.</CommandEmpty>

            {groups.map((group, index) => {
              const selected = new Set((group.column?.getFilterValue() as string[]) ?? []);

              return (
                <div key={group.title}>
                  {index > 0 && <CommandSeparator />}
                  <CommandGroup heading={group.title}>
                    {group.options.map((option) => {
                      const isSelected = selected.has(option.value);
                      return (
                        <CommandItem
                          key={`${group.title}-${option.value}`}
                          value={`${group.title} ${option.label}`}
                          onSelect={() => toggle(group, option.value)}
                          className="items-start"
                        >
                          <div
                            className={cn(
                              "mr-2 mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-sm border border-primary",
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "opacity-50 [&_svg]:invisible",
                            )}
                          >
                            <CheckIcon className="size-4" aria-hidden="true" />
                          </div>
                          <div className="flex flex-1 flex-col">
                            <span className="whitespace-normal break-words">{option.label}</span>
                            {option.description && (
                              <span className="whitespace-normal break-words text-xs text-muted-foreground">
                                {option.description}
                              </span>
                            )}
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </div>
              );
            })}

            {active > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={clearAll} className="justify-center text-center">
                    <ListRestart className="mr-2 size-4" />
                    Reiniciar filtros
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
