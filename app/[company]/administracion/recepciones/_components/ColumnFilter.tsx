"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  Check,
  ChevronsUpDown,
  Filter,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";

export type SortDirection = "asc" | "desc" | null;

/**
 * Filtro por valores presentes en la columna, con orden alfabético y búsqueda
 * propia. Sin selección la columna no filtra; el título se resalta cuando sí.
 */
export const ColumnFilter = ({
  title,
  options,
  selected,
  onChange,
  align = "center",
  formatOption,
  sort = null,
  onSortChange,
}: {
  title: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  align?: "start" | "center" | "end";
  /** Solo cambia lo que se muestra; se sigue filtrando por el valor original. */
  formatOption?: (option: string) => string;
  sort?: SortDirection;
  onSortChange?: (direction: SortDirection) => void;
}) => {
  const [search, setSearch] = useState("");
  const active = selected.length > 0;
  const labelOf = (option: string) => formatOption?.(option) ?? option;

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    const unique = Array.from(new Set(options.filter(Boolean))).sort((a, b) =>
      labelOf(a).localeCompare(labelOf(b), "es"),
    );
    return term
      ? unique.filter((option) => labelOf(option).toLowerCase().includes(term))
      : unique;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, search, formatOption]);

  const toggle = (option: string) => {
    onChange(
      selected.includes(option)
        ? selected.filter((value) => value !== option)
        : [...selected, option],
    );
  };

  const SortIcon =
    sort === "asc" ? ArrowUpAZ : sort === "desc" ? ArrowDownAZ : ChevronsUpDown;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "group inline-flex items-center gap-1 whitespace-nowrap transition-colors hover:text-foreground",
            (active || sort) && "text-foreground",
          )}
        >
          {title}
          {sort ? (
            <SortIcon className="size-3" />
          ) : (
            <Filter
              className={cn(
                "size-3 transition-opacity",
                active
                  ? "fill-current opacity-100"
                  : "opacity-0 group-hover:opacity-60",
              )}
            />
          )}
          {active && (
            <span className="select-none rounded bg-primary/10 px-1 text-[10px] font-semibold tabular-nums text-primary">
              {selected.length}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-60 p-0">
        {onSortChange && (
          <div className="flex flex-col border-b p-1">
            <button
              type="button"
              onClick={() => onSortChange(sort === "asc" ? null : "asc")}
              className={cn(
                "flex items-center gap-2 rounded-sm px-2 py-1.5 text-left text-xs transition-colors hover:bg-accent",
                sort === "asc" && "bg-accent/60 font-semibold",
              )}
            >
              <ArrowUpAZ className="size-3.5" />
              Ascendente (A–Z)
              {sort === "asc" && <Check className="ml-auto size-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => onSortChange(sort === "desc" ? null : "desc")}
              className={cn(
                "flex items-center gap-2 rounded-sm px-2 py-1.5 text-left text-xs transition-colors hover:bg-accent",
                sort === "desc" && "bg-accent/60 font-semibold",
              )}
            >
              <ArrowDownAZ className="size-3.5" />
              Descendente (Z–A)
              {sort === "desc" && <Check className="ml-auto size-3.5" />}
            </button>
          </div>
        )}

        <div className="border-b p-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={`Buscar en ${title.toLowerCase()}...`}
              className="h-7 pl-7 text-xs"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <div className="max-h-52 overflow-y-auto p-1">
          {visible.length === 0 ? (
            <p className="px-2 py-3 text-center text-xs text-muted-foreground">
              Sin coincidencias
            </p>
          ) : (
            visible.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => toggle(option)}
                className="flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-xs transition-colors hover:bg-accent"
              >
                <span className="truncate" title={labelOf(option)}>
                  {labelOf(option)}
                </span>
                {selected.includes(option) && (
                  <Check className="size-3.5 shrink-0" />
                )}
              </button>
            ))
          )}
        </div>

        {(active || sort) && (
          <div className="border-t p-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-full text-xs"
              onClick={() => {
                onChange([]);
                onSortChange?.(null);
                setSearch("");
              }}
            >
              Limpiar columna
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
