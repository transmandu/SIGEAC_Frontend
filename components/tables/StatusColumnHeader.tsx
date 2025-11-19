"use client";

import { Column } from "@tanstack/react-table";
import {
  ArrowDownIcon,
  ArrowDownNarrowWide,
  ArrowUpIcon,
  EyeOff,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StatusColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
}

const statusOptions = [
  { value: "incoming", label: "Entrante" },
  { value: "dispatched", label: "Despachado" },
  { value: "transit", label: "En Tránsito" },
  { value: "quarantine", label: "Cuarentena" },
  { value: "stored", label: "Almacenado" },
  { value: "inuse", label: "En uso" },
  { value: "sheltered", label: "Resguardo" },
  { value: "reception", label: "Recepción Administrativa" },
  { value: "intoolbox", label: "Caja de Herramientas" },
  { value: "reserved", label: "Reservado" },
  { value: "checking", label: "En Revisión" },
  { value: "maintenance", label: "Mantenimiento" },
];

export function StatusColumnHeader<TData, TValue>({
  column,
}: StatusColumnHeaderProps<TData, TValue>) {
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
          <DropdownMenuItem onClick={() => column.setFilterValue(undefined)}>
            <span className="font-medium">Todos</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {statusOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => column.setFilterValue(option.value)}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
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