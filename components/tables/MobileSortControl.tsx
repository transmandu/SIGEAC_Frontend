"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface SortOption {
  id: string;
  title: string;
}

export interface SortValue {
  id: string;
  desc: boolean;
}

/**
 * Orden de la lista para la tarjeta móvil, donde el encabezado de la tabla no
 * existe. Misma medida y acabado que los controles de la barra de
 * herramientas. Pulsar una columna la ordena de menor a mayor; pulsarla otra
 * vez invierte el sentido, y "Quitar orden" devuelve el orden original.
 */
export function MobileSortControl({
  options,
  value,
  onChange,
}: {
  options: SortOption[];
  value?: SortValue;
  onChange: (value: SortValue | undefined) => void;
}) {
  const [open, setOpen] = useState(false);

  const active = options.find((option) => option.id === value?.id);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-label="Ordenar la lista"
          className="h-10 w-full justify-between gap-2 border-slate-200/60 bg-white/80 px-3 text-sm font-normal dark:border-slate-700/60 dark:bg-slate-900/60"
        >
          <span className="flex min-w-0 items-center gap-2">
            <ArrowUpDown className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">Ordenar</span>
            {active && (
              <span className="flex min-w-0 items-center gap-1 font-medium text-foreground">
                <span className="truncate">{active.title}</span>
                {value?.desc ? (
                  <ArrowDown className="size-3.5 shrink-0 text-primary" />
                ) : (
                  <ArrowUp className="size-3.5 shrink-0 text-primary" />
                )}
              </span>
            )}
          </span>
          <ChevronDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="p-1.5" matchTriggerWidth>
        <ul className="flex flex-col">
          {options.map((option) => {
            const selected = option.id === value?.id;

            return (
              <li key={option.id}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() =>
                    onChange({
                      id: option.id,
                      desc: selected ? !value?.desc : false,
                    })
                  }
                  className={cn(
                    "flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-3 text-left text-sm transition-colors",
                    selected
                      ? "bg-primary/8 font-medium text-primary"
                      : "text-foreground active:bg-muted",
                  )}
                >
                  <span className="min-w-0 wrap-anywhere">{option.title}</span>

                  {selected && (
                    <span className="flex shrink-0 items-center gap-1 text-[13px]">
                      {value?.desc ? "Descendente" : "Ascendente"}
                      {value?.desc ? (
                        <ArrowDown className="size-4" />
                      ) : (
                        <ArrowUp className="size-4" />
                      )}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {value && (
          <button
            type="button"
            onClick={() => {
              onChange(undefined);
              setOpen(false);
            }}
            className="mt-1.5 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border-t px-3 text-sm text-muted-foreground active:bg-muted"
          >
            <X className="size-4" />
            Quitar orden
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}
