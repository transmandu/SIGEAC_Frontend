"use client";

import { CheckIcon, ListFilter, ListRestart } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
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

export interface FilterMenuGroup {
  title: string;
  options: { label: string; value: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

/**
 * El popover de filtros de las tablas (misma base visual), pero controlado: los
 * filtros de aquí no viven en columnas de TanStack. `iconOnly` lo reduce a un
 * botón cuadrado para las barras angostas.
 */
export function FilterMenu({
  groups,
  iconOnly,
  className,
}: {
  groups: FilterMenuGroup[];
  iconOnly?: boolean;
  className?: string;
}) {
  const active = groups.reduce((total, g) => total + g.selected.length, 0);

  const toggle = (group: FilterMenuGroup, value: string) =>
    group.onChange(
      group.selected.includes(value)
        ? group.selected.filter((v) => v !== value)
        : [...group.selected, value],
    );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-label="Filtros"
          className={cn(
            "relative h-10 shrink-0 rounded-md border-border bg-background font-medium text-foreground shadow-sm transition-all duration-200",
            "hover:border-primary/40 hover:bg-transparent hover:text-primary hover:shadow-md",
            "focus-visible:ring-2 focus-visible:ring-primary/20",
            iconOnly ? "w-10 px-0" : "px-4",
            active > 0 && "border-primary/40 text-primary",
            className,
          )}
        >
          <ListFilter className={cn("size-4", !iconOnly && "mr-2")} />
          {!iconOnly && "Filtros"}
          {active > 0 &&
            (iconOnly ? (
              <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                {active}
              </span>
            ) : (
              <Badge
                variant="secondary"
                className="ml-2 rounded-sm px-1.5 font-normal"
              >
                {active}
              </Badge>
            ))}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-60 p-0" align="end">
        <Command>
          <CommandList>
            {groups.map((group, index) => (
              <div key={group.title}>
                {index > 0 && <CommandSeparator />}
                <CommandGroup heading={group.title}>
                  {group.options.map((option) => {
                    const isSelected = group.selected.includes(option.value);

                    return (
                      <CommandItem
                        key={option.value}
                        value={`${group.title} ${option.label}`}
                        onSelect={() => toggle(group, option.value)}
                      >
                        <div
                          className={cn(
                            "mr-2 flex size-4 shrink-0 items-center justify-center rounded-sm border border-primary",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "opacity-50 [&_svg]:invisible",
                          )}
                        >
                          <CheckIcon className="size-4" aria-hidden="true" />
                        </div>
                        {option.label}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </div>
            ))}

            {active > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => groups.forEach((g) => g.onChange([]))}
                    className="justify-center text-center"
                  >
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
