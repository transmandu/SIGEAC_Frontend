import * as React from 'react';
import { Column } from '@tanstack/react-table';
import type { DateRange } from 'react-day-picker';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowDownIcon,
  ArrowDownNarrowWide,
  ArrowUpIcon,
  Calendar as CalendarIcon,
  Check,
  EyeOff,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

/** Valor del filtro cuando `dateRangeFilter` está activo — ambos límites opcionales, inclusive. */
export interface DateRangeFilterValue {
  from?: string;
  to?: string;
}

/**
 * filterFn para columnas de fecha con `dateRangeFilter`: compara el string
 * ISO (yyyy-MM-dd) de la celda contra el rango — orden lexicográfico basta
 * porque ISO ya ordena igual que la fecha real.
 */
export function dateRangeFilterFn<TData>(
  row: { getValue: (columnId: string) => unknown },
  columnId: string,
  filterValue: DateRangeFilterValue,
): boolean {
  const raw = row.getValue(columnId);
  if (!raw) return false;
  const cellDate = String(raw).slice(0, 10);
  if (filterValue.from && cellDate < filterValue.from) return false;
  if (filterValue.to && cellDate > filterValue.to) return false;
  return true;
}

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
  /**
   * Opciones fijas. Con `filter` también activo, dejan de ser exclusivas del
   * texto libre: el mismo input filtra tanto la lista de opciones (atajos de
   * selección exacta) como la tabla en vivo por coincidencia parcial — así
   * el usuario puede escribir "YV22" y ver la tabla acotarse sin tener que
   * encontrar y hacer clic en la opción exacta.
   */
  filterOptions?: FilterOption[];
  /** Añade un buscador sobre la lista; útil a partir de ~8 opciones. */
  searchableOptions?: boolean;
  /** Texto de ayuda bajo el input de texto libre. */
  filterHint?: string;
  /**
   * Filtro por rango de fechas (desde/hasta) en vez de texto — la columna
   * debe usar `filterFn: dateRangeFilterFn` para que el valor `{from, to}`
   * se interprete. Exclusivo con `filter`/`filterOptions`.
   */
  dateRangeFilter?: boolean;
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
  dateRangeFilter = false,
  title,
  icon: Icon,
  align = 'center',
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const filterValue = (column.getFilterValue() as string) ?? '';
  const dateRangeValue = (column.getFilterValue() as DateRangeFilterValue | undefined) ?? {};
  const hasOptions = !!filterOptions?.length;
  // Con filter + filterOptions juntos, el mismo texto sirve para acotar la
  // tabla en vivo (filterFn de la columna) y para acotar la lista de
  // opciones — no hace falta hacer clic en la opción exacta para filtrar.
  const isHybrid = filter && hasOptions;
  const sorted = column.getIsSorted();
  const hasActiveState =
    !!sorted || filterValue.length > 0 || !!dateRangeValue.from || !!dateRangeValue.to;

  const [optionSearchState, setOptionSearchState] = React.useState('');
  const optionSearch = isHybrid ? filterValue : optionSearchState;
  const setOptionSearch = isHybrid
    ? (value: string) => column.setFilterValue(value)
    : setOptionSearchState;

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

  // Sin orden ni filtro no hay menú que abrir: es solo un título. Copia la
  // métrica del botón de las columnas que sí lo tienen (alto, padding, peso
  // y tamaño de texto): si no, las columnas sin filtro se leen más pesadas
  // que sus vecinas y la fila de encabezados queda despareja.
  if (!canSort && !filter && !hasOptions && !dateRangeFilter) {
    return (
      <div className={cn('flex items-center', justify, className)}>
        <span className="flex h-8 items-center gap-2 px-2 text-sm font-medium">
          {Icon ? <Icon className="h-4 w-4 opacity-70" /> : null}
          <span className="truncate">{title}</span>
        </span>
      </div>
    );
  }

  const SortIcon =
    sorted === 'desc'
      ? ArrowDownIcon
      : sorted === 'asc'
        ? ArrowUpIcon
        : ArrowDownNarrowWide;

  // El input de escritura se muestra con `filter` (texto libre puro) y también
  // con listas que pidieron buscador — en híbrido es a la vez el filtro de la
  // tabla y el buscador de la lista de abajo.
  const showTextInput = filter || (hasOptions && searchableOptions);

  return (
    <div className={cn('flex items-center', justify, className)}>
      <DropdownMenu onOpenChange={(open) => !open && !isHybrid && setOptionSearch('')}>
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
          {/* 1. Escritura: lo primero, es lo que más se usa. */}
          {showTextInput ? (
            <>
              <div className="p-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={isHybrid ? optionSearch : filterValue}
                    onChange={(e) =>
                      isHybrid ? setOptionSearch(e.target.value) : column.setFilterValue(e.target.value)
                    }
                    placeholder={`Filtrar ${title.toLowerCase()}...`}
                    className="h-9 pl-8 pr-8"
                    // Radix devuelve el foco al item activo al abrir; sin esto
                    // la primera tecla se pierde.
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
                {!hasOptions ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {filterHint ?? 'Escribe para filtrar esta columna.'}
                  </p>
                ) : null}
              </div>
              <DropdownMenuSeparator />
            </>
          ) : null}

          {/* 1b. Rango de fechas: el calendario vive dentro de su propio
              popover, no desplegado dentro del menú. */}
          {dateRangeFilter ? (
            <>
              <div className="p-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 w-full justify-start gap-2 px-3 font-normal"
                    >
                      <CalendarIcon className="h-4 w-4 shrink-0 opacity-60" />
                      <span className="truncate">
                        {dateRangeValue.from || dateRangeValue.to
                          ? `${dateRangeValue.from ? format(parseISO(dateRangeValue.from), 'dd/MM/yy') : '…'} — ${dateRangeValue.to ? format(parseISO(dateRangeValue.to), 'dd/MM/yy') : '…'}`
                          : 'Elegir rango...'}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="z-[100] w-auto rounded-xl border-slate-400/60 p-0 shadow-lg dark:border-slate-600/60"
                    align="start"
                    sideOffset={8}
                    // Los selectores de mes/año se montan en su propio portal:
                    // elegir uno cuenta como clic fuera y cerraría el popover.
                    onInteractOutside={(event) => {
                      const target = event.target as HTMLElement | null;
                      if (target?.closest('[data-radix-select-viewport]')) {
                        event.preventDefault();
                      }
                    }}
                  >
                    <Calendar
                      mode="range"
                      locale={es}
                      selected={{
                        from: dateRangeValue.from ? parseISO(dateRangeValue.from) : undefined,
                        to: dateRangeValue.to ? parseISO(dateRangeValue.to) : undefined,
                      }}
                      onSelect={(range: DateRange | undefined) =>
                        column.setFilterValue(
                          range
                            ? {
                                from: range.from ? format(range.from, 'yyyy-MM-dd') : undefined,
                                to: range.to ? format(range.to, 'yyyy-MM-dd') : undefined,
                              }
                            : undefined,
                        )
                      }
                      captionLayout="dropdown-buttons"
                      fromYear={1900}
                      toYear={new Date().getFullYear() + 5}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <p className="mt-2 text-xs text-muted-foreground">
                  {filterHint ?? 'Deja un extremo sin elegir para no acotarlo.'}
                </p>
              </div>
              <DropdownMenuSeparator />
            </>
          ) : null}

          {/* 2. Orden. */}
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

          {/* 3. Lista de opciones. */}
          {hasOptions ? (
            <>
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
