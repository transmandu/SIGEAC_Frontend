"use client";

import { Column } from "@tanstack/react-table";
import {
  ArrowDownIcon,
  ArrowDownNarrowWide,
  ArrowUpIcon,
  EyeOff,
  RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ARTICLE_STATUS_OPTIONS } from "@/lib/warehouse/statuses";

interface StatusColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  value?: string;
  onValueChange?: (value: string | undefined) => void;
}

const statusOptions = ARTICLE_STATUS_OPTIONS;

export function StatusColumnHeader<TData, TValue>({
  column,
  value,
  onValueChange,
}: StatusColumnHeaderProps<TData, TValue>) {
  const sorted = column.getIsSorted();

  const setStatus = (v: string | undefined) => {
    // Mantiene compatibilidad con el filtrado local de la tabla (fallback)
    column.setFilterValue(v);
    onValueChange?.(v);
  };

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
            {column.getIsSorted() === "desc" ? (
              <ArrowDownIcon className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUpIcon className="ml-2 h-4 w-4" />
            ) : (
              <ArrowDownNarrowWide className="ml-2 h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-h-[400px] overflow-y-auto">
          <DropdownMenuItem onClick={() => setStatus(undefined)}>
            <span className={value ? "font-medium" : "font-bold"}>Todos</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {statusOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setStatus(option.value)}
            >
              <span className={value === option.value ? "font-bold" : undefined}>
                {option.label}
              </span>
            </DropdownMenuItem>
          ))}
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
                  column.clearSorting()
                  setStatus(undefined)
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