import * as React from 'react';
import { Column } from '@tanstack/react-table';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowDownIcon,
  ArrowDownNarrowWide,
  ArrowUpIcon,
  Check,
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

export interface FilterOption {
  value: string;
  label: string;
}

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
  filter?: boolean;
  /** Opciones fijas en vez de texto libre. */
  filterOptions?: FilterOption[];
  /** Añade un buscador sobre la lista; útil a partir de ~8 opciones. */
  searchableOptions?: boolean;
  /** Texto de ayuda bajo el input de texto libre. */
  filterHint?: string;
  icon?: LucideIcon;
  align?: Align;
}

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

export function DataTableColumnHeader<TData, TValue>({
  column,
  filter = false,
  filterOptions,
  searchableOptions = false,
  filterHint,
  title,
  icon: Icon,
  align = 'center',
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const filterValue = (column.getFilterValue() as string) ?? '';
  const hasOptions = !!filterOptions?.length;
  const sorted = column.getIsSorted();
  const hasActiveState = !!sorted || filterValue.length > 0;

  const [optionSearch, setOptionSearch] = React.useState('');

  const visibleOptions = React.useMemo(() => {
    if (!filterOptions) return [];
    const term = normalize(optionSearch);
    if (!term) return filterOptions;
    return filterOptions.filter((option) => normalize(option.label).includes(term));
  }, [filterOptions, optionSearch]);

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

  const showOptionSearch = hasOptions && searchableOptions;

  return (
    <div className={cn('flex items-center', justify, className)}>
      <DropdownMenu onOpenChange={(open) => !open && setOptionSearch('')}>
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

        <DropdownMenuContent
          align="start"
          className="max-h-[420px] w-72 overflow-y-auto"
          // El typeahead de Radix roba las letras: escribir "A" saltaba a
          // "Ascendente" en vez de llegar al input de filtro.
          onKeyDown={(event) => event.stopPropagation()}
        >
          {hasOptions ? (
            <>
              {showOptionSearch ? (
                <div className="p-2 pb-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={optionSearch}
                      onChange={(e) => setOptionSearch(e.target.value)}
                      placeholder="Buscar opción..."
                      className="h-9 pl-8"
                      // Radix devuelve el foco al item activo al abrir; sin esto
                      // la primera tecla se pierde.
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              ) : null}

              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  column.setFilterValue(undefined);
                }}
              >
                <span className={cn('flex-1', filterValue ? 'font-medium' : 'font-bold')}>
                  Todas
                </span>
                {!filterValue ? <Check className="ml-2 h-3.5 w-3.5" /> : null}
              </DropdownMenuItem>

              {visibleOptions.length ? (
                visibleOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onSelect={(e) => {
                      e.preventDefault();
                      column.setFilterValue(option.value);
                    }}
                  >
                    <span
                      className={cn(
                        'flex-1',
                        filterValue === option.value ? 'font-bold' : undefined,
                      )}
                    >
                      {option.label}
                    </span>
                    {filterValue === option.value ? (
                      <Check className="ml-2 h-3.5 w-3.5" />
                    ) : null}
                  </DropdownMenuItem>
                ))
              ) : (
                <p className="px-2 py-3 text-center text-xs text-muted-foreground">
                  Sin coincidencias.
                </p>
              )}
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
                    onKeyDown={(e) => e.stopPropagation()}
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
                  {filterHint ?? 'Escribe para filtrar esta columna.'}
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
