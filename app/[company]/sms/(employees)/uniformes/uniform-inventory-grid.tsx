"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  CircleSlash,
  Package,
  Search,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

/** Natural talla ordering (XS→XXXL), numeric sizes (38, 40…) fall back last. */
const sizeRank = (size: string) => {
  const i = SIZE_ORDER.indexOf(size.toUpperCase());
  return i === -1 ? 999 : i;
};

/** Three-state stock signal mirroring the catalog "dot" indicator. */
const getStockSignal = (item: UniformItem) => {
  if (item.is_low_stock)
    return { dot: "bg-destructive", label: "text-destructive font-semibold" };
  if (item.current_stock <= item.min_stock * 2)
    return { dot: "bg-amber-500", label: "text-foreground" };
  return { dot: "bg-emerald-500", label: "text-foreground" };
};

/** One company's worth of a uniform type — a single "stack" in the grid. */
interface UniformStack {
  key: string;
  uniform_type: string;
  type_label: string;
  company_label: string;
  items: UniformItem[];
  totalStock: number;
  lowStockCount: number;
}

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
    return Array.from(new Set(pool.map((i) => i.size))).sort(
      (a, b) => sizeRank(a) - sizeRank(b) || a.localeCompare(b)
    );
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

  /** Collapse the flat item list into one stack per (tipo, empresa). */
  const stacks = useMemo(() => {
    const map = new Map<string, UniformStack>();
    filteredItems.forEach((item) => {
      const key = `${item.uniform_type}__${item.company_label}`;
      let stack = map.get(key);
      if (!stack) {
        stack = {
          key,
          uniform_type: item.uniform_type,
          type_label: item.type_label,
          company_label: item.company_label,
          items: [],
          totalStock: 0,
          lowStockCount: 0,
        };
        map.set(key, stack);
      }
      stack.items.push(item);
      stack.totalStock += item.current_stock;
      if (item.is_low_stock) stack.lowStockCount += 1;
    });

    const list = Array.from(map.values());
    list.forEach((stack) =>
      stack.items.sort(
        (a, b) =>
          sizeRank(a.size) - sizeRank(b.size) ||
          a.size.localeCompare(b.size, undefined, { numeric: true })
      )
    );
    list.sort(
      (a, b) =>
        a.company_label.localeCompare(b.company_label) ||
        a.type_label.localeCompare(b.type_label)
    );
    return list;
  }, [filteredItems]);

  // Reset pagination whenever the active filter set changes.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [category, size, lowStockOnly, search]);

  // Drop a selected size that no longer exists in the chosen category.
  useEffect(() => {
    if (size && !sizes.includes(size)) setSize(null);
  }, [sizes, size]);

  const visibleStacks = stacks.slice(0, visibleCount);
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
                lowStockOnly &&
                  "bg-destructive text-white hover:bg-destructive/90"
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
          {stacks.length} grupo{stacks.length === 1 ? "" : "s"} ·{" "}
          {filteredItems.length} artículo
          {filteredItems.length === 1 ? "" : "s"}
        </div>
      </div>

      {/* Stacked inventory grid */}
      {stacks.length ? (
        <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleStacks.map((stack) => (
            <UniformStackCard
              key={stack.key}
              stack={stack}
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
      {visibleCount < stacks.length && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="gap-2"
          >
            Cargar más grupos
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

function UniformStackCard({
  stack,
  onEdit,
  onRegisterMovement,
}: {
  stack: UniformStack;
  onEdit: (item: UniformItem) => void;
  onRegisterMovement: (item: UniformItem) => void;
}) {
  const [open, setOpen] = useState(false);
  const Icon = getUniformTypeIcon(stack.uniform_type, stack.type_label);
  const sizeCount = stack.items.length;
  const isStack = sizeCount > 1;

  return (
    <div className="group relative isolate">
      {/* Layered "stack" edges peeking out the bottom — only when grouped */}
      {isStack && (
        <>
          <div
            className={cn(
              "pointer-events-none absolute inset-x-3 top-0 -z-10 h-full rounded-lg border border-border/50 bg-card/70 transition-[transform,opacity] duration-300 ease-out",
              open
                ? "translate-y-0 opacity-0"
                : "translate-y-[6px] group-hover:translate-y-[9px]"
            )}
          />
          <div
            className={cn(
              "pointer-events-none absolute inset-x-1.5 top-0 -z-10 h-full rounded-lg border border-border/60 bg-card transition-[transform,opacity] duration-300 ease-out",
              open
                ? "translate-y-0 opacity-0"
                : "translate-y-[3px] group-hover:translate-y-[4px]"
            )}
          />
        </>
      )}

      <Collapsible
        open={open}
        onOpenChange={setOpen}
        className={cn(
          "overflow-hidden rounded-lg border bg-card transition-colors duration-200",
          open ? "border-primary/40" : "hover:border-primary/40"
        )}
      >
        <CollapsibleTrigger className="group/t block w-full text-left outline-none transition-colors hover:bg-muted/20 focus-visible:bg-muted/20">
          <div className="flex items-start gap-3 p-4 pb-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-md border border-border/60 bg-muted/40 text-muted-foreground">
              <Icon className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                {stack.type_label}
              </p>
              <h3 className="truncate text-base font-semibold uppercase leading-tight text-foreground">
                {stack.company_label}
              </h3>
            </div>
            <ChevronDown className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]/t:rotate-180" />
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-border/60 px-4 py-2.5">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-lg font-bold leading-none tabular-nums text-foreground">
                {stack.totalStock}
              </span>
              <span className="text-xs text-muted-foreground">
                uds · {sizeCount} {sizeCount === 1 ? "talla" : "tallas"}
              </span>
            </div>
            {stack.lowStockCount > 0 ? (
              <span className="inline-flex items-center gap-1 rounded border border-amber-200 bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-400">
                <AlertTriangle className="size-3" />
                {stack.lowStockCount} bajo stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Stock ok
              </span>
            )}
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          <div className="border-t border-border/60 bg-muted/10">
            <div className="grid grid-cols-[44px_1fr_auto] items-center gap-3 px-4 pb-1 pt-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                Talla
              </span>
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                Stock
              </span>
              <span className="sr-only">Acciones</span>
            </div>
            {stack.items.map((item) => (
              <SizeRow
                key={item.id}
                item={item}
                onEdit={onEdit}
                onRegisterMovement={onRegisterMovement}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function SizeRow({
  item,
  onEdit,
  onRegisterMovement,
}: {
  item: UniformItem;
  onEdit: (item: UniformItem) => void;
  onRegisterMovement: (item: UniformItem) => void;
}) {
  const signal = getStockSignal(item);

  return (
    <div
      className={cn(
        "grid grid-cols-[44px_1fr_auto] items-center gap-3 border-t border-border/30 px-4 py-2 transition-colors hover:bg-muted/20",
        !item.active && "opacity-60"
      )}
    >
      <Badge
        variant="outline"
        className="w-full justify-center bg-background font-mono text-[11px] tracking-widest"
      >
        {item.size}
      </Badge>
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className={cn("size-2 rounded-full", signal.dot)} />
          <span className={cn("font-mono text-xs tabular-nums", signal.label)}>
            {item.current_stock} en stock
          </span>
          {!item.active && (
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
              <CircleSlash className="size-3" />
              Inactivo
            </span>
          )}
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">
          mín ≥ {item.min_stock}
        </span>
      </div>
      <InventoryRowActions
        item={item}
        onEdit={onEdit}
        onRegisterMovement={onRegisterMovement}
      />
    </div>
  );
}
