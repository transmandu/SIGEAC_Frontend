import * as React from 'react';
import { Column } from '@tanstack/react-table';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowDownIcon,
  ArrowDownNarrowWide,
  ArrowUpIcon,
  EyeOff,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';

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

type Align = 'left' | 'center' | 'right';

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
  filter?: boolean;
  /** Opciones fijas en vez de texto libre. */
  filterOptions?: { value: string; label: string }[];
  icon?: LucideIcon;
  align?: Align;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  filter = false,
  filterOptions,
  title,
  icon: Icon,
  align = 'center',
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const filterValue = (column.getFilterValue() as string) ?? '';
  const hasOptions = !!filterOptions?.length;
  const sorted = column.getIsSorted();
  const hasActiveState = !!sorted || filterValue.length > 0;

  const handleReset = () => {
    column.clearSorting();
    column.setFilterValue(undefined);
  };

  const justify =
    align === 'left'
      ? 'justify-start'
      : align === 'right'
        ? 'justify-end'
        : 'justify-center';

  const canSort = column.getCanSort();

  // Sin orden ni filtro no hay menú que abrir: es solo un título.
  if (!canSort && !filter && !hasOptions) {
    return (
      <div className={cn('flex items-center gap-2', justify, className)}>
        {Icon ? <Icon className="h-4 w-4 opacity-70" /> : null}
        <span className="truncate">{title}</span>
      </div>
    );
  }

  const SortIcon =
    sorted === 'desc'
      ? ArrowDownIcon
      : sorted === 'asc'
        ? ArrowUpIcon
        : ArrowDownNarrowWide;

  return (
    <div className={cn('flex items-center', justify, className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2 data-[state=open]:bg-accent"
          >
            {Icon ? <Icon className="mr-2 h-4 w-4 opacity-70" /> : null}
            <span className="truncate">{title}</span>
            {canSort ? <SortIcon className="ml-2 h-4 w-4 opacity-80" /> : null}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="max-h-[420px] w-72 overflow-y-auto">
          {hasOptions ? (
            <>
              <DropdownMenuItem onClick={() => column.setFilterValue(undefined)}>
                <span className={filterValue ? 'font-medium' : 'font-bold'}>Todas</span>
              </DropdownMenuItem>
              {filterOptions!.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => column.setFilterValue(option.value)}
                >
                  <span
                    className={
                      filterValue === option.value ? 'font-bold' : undefined
                    }
                  >
                    {option.label}
                  </span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </>
          ) : filter ? (
            <>
              <div className="p-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={filterValue}
                    onChange={(e) => column.setFilterValue(e.target.value)}
                    placeholder={`Filtrar ${title.toLowerCase()}...`}
                    className="h-9 pl-8 pr-8"
                  />
                  {filterValue.length > 0 ? (
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
                  ) : null}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Escribe para filtrar esta columna.
                </p>
              </div>
              <DropdownMenuSeparator />
            </>
          ) : null}

          {canSort ? (
            <>
              <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
                <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                <span className={sorted === 'asc' ? 'font-bold' : undefined}>
                  Ascendente
                </span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
                <ArrowDownIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                <span className={sorted === 'desc' ? 'font-bold' : undefined}>
                  Descendente
                </span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
            </>
          ) : null}

          {hasActiveState ? (
            <>
              <DropdownMenuItem onClick={handleReset}>
                <RotateCcw className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                Restablecer columna
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          ) : null}

          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <EyeOff className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Ocultar columna
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
