import * as React from 'react';
import { Column } from '@tanstack/react-table';
import { ArrowDownIcon, ArrowDownNarrowWide, ArrowUpIcon, EyeOff, Search, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
  filter?: boolean;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  filter,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const filterValue = (column.getFilterValue() as string) ?? '';

  if (!column.getCanSort()) return <div className={cn(className)}>{title}</div>;

  const SortIcon =
    column.getIsSorted() === 'desc'
      ? ArrowDownIcon
      : column.getIsSorted() === 'asc'
        ? ArrowUpIcon
        : ArrowDownNarrowWide;

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 px-2 data-[state=open]:bg-accent">
            <span className="truncate">{title}</span>
            <SortIcon className="ml-2 h-4 w-4 opacity-80" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-64">
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={filterValue}
                onChange={(e) => column.setFilterValue(e.target.value)}
                placeholder={`Filtrar ${title.toLowerCase()}...`}
                className="h-9 pl-8 pr-8"
              />
              {filterValue?.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                  onClick={() => column.setFilterValue('')}
                  aria-label="Limpiar filtro"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Escribe para filtrar esta columna.</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Ascendente
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDownIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Descendente
          </DropdownMenuItem>

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
