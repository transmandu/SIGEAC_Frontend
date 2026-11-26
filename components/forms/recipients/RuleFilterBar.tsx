"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Search, SearchX, SlidersHorizontal } from "lucide-react";

import {
  fieldClass,
  selectTriggerClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { PanelStaticLabel } from "@/components/forms/PanelSection";
import { TARGET_TYPES } from "@/components/forms/recipients/recipient-targets";
import { EmptyState } from "@/components/misc/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/** Lo mínimo que tiene una regla de "quién ve / recibe esto", de alertas, in-app o correos. */
export interface FilterableRule {
  target_type: string;
  target_label: string;
  target_detail: string | null;
  is_active: boolean;
  instruction?: string | null;
}

const ALL = "all";

type StatusFilter = typeof ALL | "active" | "inactive";
type SortKey = "original" | "name" | "type" | "status";

interface RuleFilters {
  query: string;
  status: StatusFilter;
  type: string;
  sort: SortKey;
}

const INITIAL: RuleFilters = {
  query: "",
  status: ALL,
  type: ALL,
  sort: "original",
};

const SORT_LABELS: Record<SortKey, string> = {
  original: "Orden de alta",
  name: "Nombre",
  type: "Tipo de destinatario",
  status: "Activas primero",
};

const typeLabel = (type: string) =>
  TARGET_TYPES.find((item) => item.type === type)?.label ?? type;

/** Sin tildes ni mayúsculas: "gerencia" encuentra "Gerencia" y "Gerencía". */
const fold = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

const byName = (a: FilterableRule, b: FilterableRule) =>
  a.target_label.localeCompare(b.target_label, "es", { sensitivity: "base" });

const SORTERS: Record<
  Exclude<SortKey, "original">,
  (a: FilterableRule, b: FilterableRule) => number
> = {
  name: byName,
  type: (a, b) =>
    typeLabel(a.target_type).localeCompare(typeLabel(b.target_type), "es") ||
    byName(a, b),
  status: (a, b) => Number(b.is_active) - Number(a.is_active) || byName(a, b),
};

/**
 * Estado de búsqueda, filtros y orden de una lista de reglas. Vive en quien
 * pinta la lista (cambiar de alerta o aviso lo reinicia, porque el panel se
 * remonta) y `visible` es lo que hay que dibujar.
 */
export function useRuleFilters<T extends FilterableRule>(rules: T[]) {
  const [chosen, setFilters] = useState<RuleFilters>(INITIAL);
  const query = fold(useDeferredValue(chosen.query).trim());

  // Si se quitó la última regla del tipo elegido, ese tipo ya no existe en el
  // selector: el filtro deja de aplicarse en vez de quedar oculto vaciando la lista.
  const filters: RuleFilters = {
    ...chosen,
    type:
      chosen.type === ALL ||
      rules.some((rule) => rule.target_type === chosen.type)
        ? chosen.type
        : ALL,
  };

  const visible = useMemo(() => {
    const matching = rules.filter((rule) => {
      if (filters.status === "active" && !rule.is_active) return false;
      if (filters.status === "inactive" && rule.is_active) return false;
      if (filters.type !== ALL && rule.target_type !== filters.type) {
        return false;
      }
      if (!query) return true;

      return fold(
        [
          rule.target_label,
          rule.target_detail,
          typeLabel(rule.target_type),
          rule.instruction,
        ]
          .filter(Boolean)
          .join(" "),
      ).includes(query);
    });

    return filters.sort === "original"
      ? matching
      : [...matching].sort(SORTERS[filters.sort]);
  }, [rules, filters.status, filters.type, filters.sort, query]);

  // La búsqueda va aparte: ya se ve en su campo. El punto del botón avisa solo
  // de lo que queda oculto dentro del menú.
  const hidden =
    Number(filters.status !== ALL) +
    Number(filters.type !== ALL) +
    Number(filters.sort !== "original");

  return {
    filters,
    visible,
    hidden,
    narrowed: hidden > 0 || query !== "",
    update: (patch: Partial<RuleFilters>) =>
      setFilters((current) => ({ ...current, ...patch })),
    reset: () => setFilters(INITIAL),
  };
}

type RuleFilterState = ReturnType<typeof useRuleFilters>;

/**
 * Fila sobre la lista de reglas, en el lenguaje del panel que la contiene: la
 * superficie blanca con divisor suave (la franja gris ya es la cabecera del
 * panel) y los campos del formulario (`fieldClass`), compactos para no quitar
 * protagonismo a la lista. A la derecha, el botón con icono que abre los
 * filtros (estado, tipo de destinatario) y el orden, y a su derecha el
 * buscador; a la izquierda, el recuento "N de M" cuando algo filtra.
 */
export function RuleFilterBar({
  rules,
  state,
}: {
  rules: FilterableRule[];
  state: RuleFilterState;
}) {
  const { filters, visible, hidden, narrowed, update } = state;
  const [open, setOpen] = useState(false);

  const active = rules.filter((rule) => rule.is_active).length;
  const types = TARGET_TYPES.map((item) => ({
    ...item,
    count: rules.filter((rule) => rule.target_type === item.type).length,
  })).filter((item) => item.count > 0);

  return (
    <div className="flex items-center justify-end gap-2 border-b border-border/60 px-4 py-2 max-sm:px-3">
      {narrowed && (
        <span className="mr-auto text-xs tabular-nums text-muted-foreground max-sm:hidden">
          {visible.length} de {rules.length}
        </span>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Filtros y orden"
                className={cn(
                  fieldClass,
                  "relative size-8 shrink-0 p-0 max-sm:size-10",
                )}
              >
                <SlidersHorizontal className="size-4" />
                {hidden > 0 && (
                  <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                    {hidden}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="top" className="px-2 py-1 text-xs">
            Filtros y orden
          </TooltipContent>
        </Tooltip>

        <PopoverContent
          align="center"
          sideOffset={8}
          collisionPadding={12}
          className="w-72 max-w-[calc(100vw-2rem)] space-y-4 p-4"
        >
          <div>
            <PanelStaticLabel>Estado</PanelStaticLabel>
            <Select
              value={filters.status}
              onValueChange={(status) =>
                update({ status: status as StatusFilter })
              }
            >
              <SelectTrigger className={selectTriggerClass} aria-label="Estado">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL} suffix={rules.length}>
                  Todas
                </SelectItem>
                <SelectItem value="active" suffix={active}>
                  Activas
                </SelectItem>
                <SelectItem value="inactive" suffix={rules.length - active}>
                  Desactivadas
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {types.length > 1 && (
            <div>
              <PanelStaticLabel>Tipo de destinatario</PanelStaticLabel>
              <Select
                value={filters.type}
                onValueChange={(type) => update({ type })}
              >
                <SelectTrigger
                  className={selectTriggerClass}
                  aria-label="Tipo de destinatario"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL} suffix={rules.length}>
                    Todos
                  </SelectItem>
                  {types.map(({ type, label, count }) => (
                    <SelectItem key={type} value={type} suffix={count}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <PanelStaticLabel>Ordenar por</PanelStaticLabel>
            <Select
              value={filters.sort}
              onValueChange={(sort) => update({ sort: sort as SortKey })}
            >
              <SelectTrigger
                className={selectTriggerClass}
                aria-label="Ordenar por"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {SORT_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full max-sm:h-10"
            disabled={hidden === 0}
            onClick={() => {
              update({ status: ALL, type: ALL, sort: "original" });
              setOpen(false);
            }}
          >
            Restablecer filtros
          </Button>
        </PopoverContent>
      </Popover>

      <div className="relative w-56 max-sm:flex-1">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-2.5 top-1/2 z-10 size-3.5 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={filters.query}
          onChange={(event) => update({ query: event.target.value })}
          placeholder="Buscar destinatarios..."
          aria-label="Buscar destinatarios"
          className={cn(
            fieldClass,
            "h-8 pl-8 text-xs max-sm:h-10 max-sm:text-base",
          )}
        />
      </div>
    </div>
  );
}

/** Lo que se ve cuando la búsqueda o los filtros no dejan ninguna regla. */
export function RuleFilterEmpty({ onReset }: { onReset: () => void }) {
  return (
    <EmptyState
      icon={SearchX}
      title="Sin coincidencias"
      description="Ninguna regla coincide con la búsqueda o los filtros aplicados."
      className="py-8"
      action={
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-1 h-8 max-sm:h-10"
          onClick={onReset}
        >
          Limpiar búsqueda y filtros
        </Button>
      }
    />
  );
}
