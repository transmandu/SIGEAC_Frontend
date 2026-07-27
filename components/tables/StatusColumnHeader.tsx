"use client";

import { Column } from "@tanstack/react-table";
import {
  ArrowDownIcon,
  ArrowDownNarrowWide,
  ArrowUpIcon,
  Check,
  EyeOff,
  RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  ARTICLE_STATUS_OPTIONS,
  TOOL_STATUS_OPTIONS,
} from "@/lib/warehouse/statuses";

interface StatusColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  value?: string;
  onValueChange?: (value: string | undefined) => void;
  /** Los subestados de calibración solo aplican a la pestaña de herramientas. */
  showToolStatuses?: boolean;
}

export function StatusColumnHeader<TData, TValue>({
  column,
  value,
  onValueChange,
  showToolStatuses = false,
}: StatusColumnHeaderProps<TData, TValue>) {
  const sorted = column.getIsSorted();

  const setStatus = (v: string | undefined) => {
    // Mantiene compatibilidad con el filtrado local de la tabla (fallback)
    column.setFilterValue(v);
    onValueChange?.(v);
  };

  const renderOption = (option: { value: string; label: string }) => (
    <DropdownMenuItem
      key={option.value}
      onSelect={(e) => {
        e.preventDefault();
        setStatus(option.value);
      }}
    >
      <span className={cn("flex-1", value === option.value ? "font-bold" : undefined)}>
        {option.label}
      </span>
      {value === option.value ? <Check className="ml-2 h-3.5 w-3.5" /> : null}
    </DropdownMenuItem>
  );

  return (
    <div className="flex flex-col items-center justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          >
            <span>Estado</span>
            {sorted === "desc" ? (
              <ArrowDownIcon className="ml-2 h-4 w-4" />
            ) : sorted === "asc" ? (
              <ArrowUpIcon className="ml-2 h-4 w-4" />
            ) : (
              <ArrowDownNarrowWide className="ml-2 h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="max-h-[420px] w-72 overflow-y-auto"
          // Sin esto el typeahead de Radix captura las letras y salta a
          // "Ascendente"/"Descendente".
          onKeyDown={(event) => event.stopPropagation()}
        >
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setStatus(undefined);
            }}
          >
            <span className={cn("flex-1", value ? "font-medium" : "font-bold")}>
              Todos
            </span>
            {!value ? <Check className="ml-2 h-3.5 w-3.5" /> : null}
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          {ARTICLE_STATUS_OPTIONS.map(renderOption)}

          {showToolStatuses ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Calibración de herramienta
              </DropdownMenuLabel>
              {TOOL_STATUS_OPTIONS.map(renderOption)}
            </>
          ) : null}

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            <span className={sorted === "asc" ? "font-bold" : undefined}>Ascendente</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDownIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            <span className={sorted === "desc" ? "font-bold" : undefined}>Descendente</span>
          </DropdownMenuItem>

          {(sorted || value) && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  column.clearSorting();
                  setStatus(undefined);
                }}
              >
                <RotateCcw className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                Restablecer columna
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <EyeOff className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Ocultar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
