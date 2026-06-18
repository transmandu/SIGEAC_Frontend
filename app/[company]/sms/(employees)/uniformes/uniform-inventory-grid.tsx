"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CircleSlash,
  Package,
  Search,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { UniformItem } from "@/hooks/sms/useGetUniforms";
import { getUniformTypeIcon } from "@/components/sms/uniform-meta";

import { InventoryRowActions } from "./row-actions";

interface Props {
  items: UniformItem[];
  onEdit: (item: UniformItem) => void;
  onRegisterMovement: (item: UniformItem) => void;
}

const PAGE_SIZE = 12;

/** Three-state stock signal mirroring the catalog "dot" indicator. */
const getStockSignal = (item: UniformItem) => {
  if (item.is_low_stock)
    return { dot: "bg-destructive", label: "text-destructive font-semibold" };
  if (item.current_stock <= item.min_stock * 2)
    return { dot: "bg-amber-500", label: "text-foreground" };
  return { dot: "bg-emerald-500", label: "text-foreground" };
};

export function UniformInventoryGrid({
  items,
  onEdit,
  onRegisterMovement,
}: Props) {
  const [category, setCategory] = useState<string>("all");
  const [size, setSize] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  /** Distinct uniform types present in the data become the category tabs. */
  const categories = useMemo(() => {
    const map = new Map<string, string>();
    items.forEach((i) => map.set(i.uniform_type, i.type_label));
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [items]);

  /** Sizes available within the currently selected category. */
  const sizes = useMemo(() => {
    const pool =
      category === "all"
        ? items
        : items.filter((i) => i.uniform_type === category);
    return Array.from(new Set(pool.map((i) => i.size))).sort();
  }, [items, category]);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((item) => {
      if (category !== "all" && item.uniform_type !== category) return false;
      if (size && item.size !== size) return false;
      if (lowStockOnly && !item.is_low_stock) return false;
      if (term) {
        const haystack =
          `${item.type_label} ${item.company_label} ${item.size}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [items, category, size, lowStockOnly, search]);

  // Reset pagination whenever the active filter set changes.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [category, size, lowStockOnly, search]);

  // Drop a selected size that no longer exists in the chosen category.
  useEffect(() => {
    if (size && !sizes.includes(size)) setSize(null);
  }, [sizes, size]);

  const visibleItems = filteredItems.slice(0, visibleCount);
  const activeCategoryLabel = categories.find(
    (c) => c.value === category
  )?.label;
  const hasActiveFilters = category !== "all" || size || lowStockOnly;

  const clearAll = () => {
    setCategory("all");
    setSize(null);
    setLowStockOnly(false);
  };

  return (
    <div className="space-y-4">
      {/* Filter bar: category tabs + sub-filters */}
      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="flex overflow-x-auto border-b">
          <button
            onClick={() => setCategory("all")}
            className={cn(
              "whitespace-nowrap px-6 py-3 text-xs font-bold uppercase tracking-wider transition-colors hover:bg-muted/50",
              category === "all"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground"
            )}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={cn(
                "whitespace-nowrap px-6 py-3 text-xs font-bold uppercase tracking-wider transition-colors hover:bg-muted/50",
                category === cat.value
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 bg-muted/30 px-6 py-4 md:grid-cols-3">
          {/* Size filter */}
          <div>
            <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Talla
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {sizes.length ? (
                sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize((prev) => (prev === s ? null : s))}
                    className={cn(
                      "rounded border px-2.5 py-1 font-mono text-xs transition-colors",
                      size === s
                        ? "border-2 border-primary bg-primary/5 font-medium text-primary"
                        : "border-border bg-background text-foreground hover:border-primary hover:text-primary"
                    )}
                  >
                    {s}
                  </button>
                ))
              ) : (
                <span className="text-xs italic text-muted-foreground">
                  Sin tallas
                </span>
              )}
            </div>
          </div>

          {/* Search */}
          <div>
            <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Buscar
            </h4>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tipo, empresa o talla..."
                className="h-9 pl-9 text-sm"
              />
            </div>
          </div>

          {/* Status filter */}
          <div>
            <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Estado
            </h4>
            <Button
              type="button"
              variant={lowStockOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setLowStockOnly((v) => !v)}
              className={cn(
                "h-9 gap-2",
                lowStockOnly && "bg-destructive text-white hover:bg-destructive/90"
              )}
            >
              <AlertTriangle className="h-4 w-4" />
              Solo bajo stock
            </Button>
          </div>
        </div>
      </div>

      {/* Active filters + result count */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Filtros activos:
        </span>
        {category !== "all" && (
          <FilterChip
            label={`Tipo: ${activeCategoryLabel}`}
            onClear={() => setCategory("all")}
          />
        )}
        {size && (
          <FilterChip label={`Talla: ${size}`} onClear={() => setSize(null)} />
        )}
        {lowStockOnly && (
          <FilterChip
            label="Bajo stock"
            onClear={() => setLowStockOnly(false)}
          />
        )}
        {!hasActiveFilters && (
          <span className="text-xs italic text-muted-foreground">Ninguno</span>
        )}
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="ml-1 text-xs font-medium text-primary hover:underline"
          >
            Limpiar todo
          </button>
        )}
        <div className="ml-auto font-mono text-xs text-muted-foreground">
          Mostrando {visibleItems.length} de {filteredItems.length} artículo
          {filteredItems.length === 1 ? "" : "s"}
        </div>
      </div>

      {/* Inventory grid */}
      {filteredItems.length ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleItems.map((item) => (
            <UniformCard
              key={item.id}
              item={item}
              onEdit={onEdit}
              onRegisterMovement={onRegisterMovement}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-20 text-center">
          <Package className="size-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No hay artículos que coincidan con los filtros.
          </p>
        </div>
      )}

      {/* Load more */}
      {visibleCount < filteredItems.length && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="gap-2"
          >
            Cargar más artículos
          </Button>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  label,
  onClear,
}: {
  label: string;
  onClear: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded border bg-muted px-2 py-1 text-xs font-medium text-foreground">
      {label}
      <button
        onClick={onClear}
        className="text-muted-foreground transition-colors hover:text-destructive"
      >
        <X className="size-3.5" />
      </button>
    </span>
  );
}

function UniformCard({
  item,
  onEdit,
  onRegisterMovement,
}: {
  item: UniformItem;
  onEdit: (item: UniformItem) => void;
  onRegisterMovement: (item: UniformItem) => void;
}) {
  const Icon = getUniformTypeIcon(item.uniform_type, item.type_label);
  const signal = getStockSignal(item);

  return (
    <div
      className={cn(
        "group flex flex-col overflow-hidden rounded-lg border bg-card transition-colors duration-300 hover:border-primary/50",
        !item.active && "opacity-60"
      )}
    >
      {/* Visual / icon area */}
      <div className="relative flex h-40 items-center justify-center border-b bg-muted/40">
        <Icon className="size-16 text-muted-foreground/40 transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute right-2 top-2">
          <Badge
            variant="outline"
            className="bg-background font-mono text-[10px] tracking-widest"
          >
            {item.size}
          </Badge>
        </div>
        {item.is_low_stock && (
          <span className="absolute left-2 top-2 rounded border border-amber-300 bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-amber-800 shadow-sm dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300">
            Bajo stock
          </span>
        )}
        {!item.active && (
          <span className="absolute left-2 bottom-2 inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            <CircleSlash className="size-3" />
            Inactivo
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-semibold uppercase leading-tight text-foreground">
          {item.type_label}
        </h3>
        <p className="mb-3 mt-1 flex-1 text-[13px] uppercase text-muted-foreground">
          {item.company_label} • Talla {item.size}
        </p>
        <div className="mt-auto flex items-center justify-between border-t pt-3">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className={cn("size-2 rounded-full", signal.dot)} />
              <span className={cn("font-mono text-xs", signal.label)}>
                {item.current_stock} en stock
              </span>
            </div>
            <span className="font-mono text-[11px] text-muted-foreground">
              mínimo ≥ {item.min_stock}
            </span>
          </div>
          <InventoryRowActions
            item={item}
            onEdit={onEdit}
            onRegisterMovement={onRegisterMovement}
          />
        </div>
      </div>
    </div>
  );
}
