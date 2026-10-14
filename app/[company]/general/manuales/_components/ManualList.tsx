"use client";

import { useMemo, useState } from "react";
import {
  BookDashed,
  BookOpen,
  Eye,
  History,
  Loader2,
  Pencil,
  SearchX,
  Trash2,
  Wrench,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { DataTableSearchInput } from "@/components/tables/DataTableSearchInput";
import { sectionClass } from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { STATUS_LABELS } from "@/lib/maintenanceCatalogLabels";
import { cn } from "@/lib/utils";
import type { CatalogManual } from "@/types/maintenanceCatalog";
import type { ManualFilters } from "./catalog-filters";
import { FilterMenu } from "./FilterMenu";
import { ItemActions } from "./ItemActions";

/** Id del grupo virtual de servicios sin manual: ningún manual real es negativo. */
export const NO_MANUAL_ID = -1;

const NO_MANUAL_LABEL = "Sin manual asignado";

/** Lo que el menú de un manual puede pedir; el panel lo resuelve al cargar el detalle. */
export type ManualAction = "details" | "edit" | "revision" | "delete";

interface ManualListProps {
  /** Ya ordenados: la pantalla elige el primero como selección por defecto. */
  manuals: CatalogManual[];
  /** Cantidad de servicios sin manual; 0 oculta el grupo. */
  unassignedCount: number;
  loading: boolean;
  selectedId: number | null;
  onSelect: (id: number) => void;
  onAction: (id: number, action: ManualAction) => void;
  canManage: boolean;
  filters: ManualFilters;
  onFiltersChange: (filters: ManualFilters) => void;
  /**
   * Con filtros de servicio activos: cuántos servicios coinciden en cada
   * manual (el grupo sin manual usa NO_MANUAL_ID). Reemplaza el total.
   */
  matchCounts: Map<number, number> | null;
  /** Hay filtros activos: cambia el mensaje de la lista vacía. */
  filtered: boolean;
}

// El buscador se arma sobre el texto que el usuario ve, no sobre los valores
// guardados ("ACTIVE" nunca coincidiría con "vigente").
const matches = (manual: CatalogManual, term: string) =>
  [
    manual.name,
    manual.manual_code,
    manual.revision,
    manual.description,
    STATUS_LABELS[manual.status],
  ].some((value) => value?.toLowerCase().includes(term));

const cardClass = (selected: boolean) =>
  cn(
    "group relative rounded-xl border transition-all duration-200",
    "bg-linear-to-br from-background/70 to-background/40",
    selected
      ? "border-primary/50 bg-primary/5 shadow-sm ring-1 ring-primary/20"
      : "border-slate-400/40 hover:border-primary/40 hover:shadow-sm dark:border-slate-600/40",
  );

const IconTile = ({
  icon: Icon,
  selected,
}: {
  icon: typeof BookOpen;
  selected: boolean;
}) => (
  <span
    className={cn(
      "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
      selected
        ? "bg-primary text-primary-foreground"
        : "bg-primary/10 text-primary",
    )}
  >
    <Icon className="size-4" />
  </span>
);

const MiniField = ({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) => (
  <div className="min-w-0">
    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </p>
    <p
      className={cn(
        "truncate text-xs font-medium",
        !value && "text-muted-foreground/60",
      )}
      title={value ?? undefined}
    >
      {value || "—"}
    </p>
  </div>
);

const ServicesCount = ({
  count,
  matched,
}: {
  count: number;
  /** Con filtros de servicio: se muestran las coincidencias, no el total. */
  matched?: boolean;
}) => (
  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
    <Wrench className="size-3" />
    <span className="font-semibold text-foreground">{count}</span>
    {matched
      ? count === 1
        ? "coincide"
        : "coinciden"
      : count === 1
        ? "servicio"
        : "servicios"}
  </span>
);

export function ManualList({
  manuals,
  unassignedCount,
  loading,
  selectedId,
  onSelect,
  onAction,
  canManage,
  filters,
  onFiltersChange,
  matchCounts,
  filtered,
}: ManualListProps) {
  const [search, setSearch] = useState("");

  const term = search.trim().toLowerCase();
  const visible = useMemo(
    () => manuals.filter((manual) => !term || matches(manual, term)),
    [manuals, term],
  );
  const showUnassigned =
    unassignedCount > 0 &&
    (!term || NO_MANUAL_LABEL.toLowerCase().includes(term));

  return (
    <aside
      className={cn(
        sectionClass,
        "flex h-96 min-w-0 flex-col gap-3 lg:h-full lg:min-h-0",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <BookOpen className="size-4 text-primary" />
          Manuales
        </h2>
        <span className="text-xs text-muted-foreground">{manuals.length}</span>
      </div>

      <div className="flex items-center gap-2">
        <DataTableSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar manual..."
          className="min-w-0 flex-1"
        />
        <FilterMenu
          iconOnly
          groups={[
            {
              title: "Estado",
              options: Object.entries(STATUS_LABELS).map(([value, label]) => ({
                value,
                label,
              })),
              selected: filters.status,
              onChange: (status) => onFiltersChange({ ...filters, status }),
            },
            {
              title: "Soporte",
              options: [
                { value: "DIGITAL", label: "Digital" },
                { value: "PHYSICAL", label: "Solo físico" },
              ],
              selected: filters.support,
              onChange: (support) => onFiltersChange({ ...filters, support }),
            },
          ]}
        />
      </div>

      <div className="-mr-1 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : visible.length === 0 && !showUnassigned ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <span className="flex size-10 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground">
              <SearchX className="size-5" />
            </span>
            <p className="text-sm font-medium text-muted-foreground">
              {manuals.length === 0 && !filtered
                ? "Sin manuales registrados"
                : "Sin resultados"}
            </p>
            {filtered && manuals.length === 0 && (
              <p className="text-xs text-muted-foreground/70">
                Ningún manual coincide con los filtros activos.
              </p>
            )}
          </div>
        ) : (
          <>
            {visible.map((manual) => {
              const selected = manual.id === selectedId;
              const superseded = manual.status === "SUPERSEDED";
              const servicesCount = manual.services_count ?? 0;
              const shownCount = matchCounts
                ? (matchCounts.get(manual.id) ?? 0)
                : servicesCount;

              return (
                <div
                  key={manual.id}
                  className={cn(
                    cardClass(selected),
                    superseded && !selected && "opacity-70",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(manual.id)}
                    aria-pressed={selected}
                    className="flex w-full min-w-0 flex-col gap-2.5 rounded-xl p-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  >
                    {/* El padding derecho deja sitio al menú de tres puntos,
                        que va superpuesto: un botón no puede contener otro. */}
                    <span className="flex items-start gap-2.5 pr-8">
                      <IconTile icon={BookOpen} selected={selected} />
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-2 wrap-break-word text-sm font-semibold leading-snug">
                          {manual.name}
                        </span>
                        {superseded && (
                          <Badge
                            variant="secondary"
                            className="mt-1 text-[10px]"
                          >
                            {STATUS_LABELS.SUPERSEDED}
                          </Badge>
                        )}
                      </span>
                    </span>

                    <span className="grid grid-cols-2 gap-x-3">
                      <MiniField label="Código" value={manual.manual_code} />
                      <MiniField label="Revisión" value={manual.revision} />
                    </span>

                    <span className="flex justify-center border-t border-slate-400/30 pt-2 dark:border-slate-600/30">
                      <ServicesCount
                        count={shownCount}
                        matched={matchCounts !== null}
                      />
                    </span>
                  </button>

                  <div className="absolute right-1.5 top-1.5">
                    <ItemActions
                      label={`Acciones de ${manual.name}`}
                      actions={[
                        {
                          label: "Ver detalles",
                          icon: Eye,
                          onSelect: () => onAction(manual.id, "details"),
                        },
                        {
                          label: "Editar manual",
                          icon: Pencil,
                          tone: "primary",
                          hidden: !canManage,
                          onSelect: () => onAction(manual.id, "edit"),
                        },
                        {
                          label: "Nueva revisión",
                          icon: History,
                          hidden: !canManage || superseded,
                          onSelect: () => onAction(manual.id, "revision"),
                        },
                        {
                          // Con servicios el backend rechaza el borrado: no se
                          // ofrece en vez de mostrarlo y fallar.
                          label: "Eliminar manual",
                          icon: Trash2,
                          tone: "danger",
                          hidden: !canManage || servicesCount > 0,
                          onSelect: () => onAction(manual.id, "delete"),
                        },
                      ]}
                    />
                  </div>
                </div>
              );
            })}

            {showUnassigned && (
              <div
                // Borde discontinuo: no es un manual, es el cajón de lo que
                // todavía no tiene uno.
                className={cn(
                  cardClass(selectedId === NO_MANUAL_ID),
                  "border-dashed",
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelect(NO_MANUAL_ID)}
                  aria-pressed={selectedId === NO_MANUAL_ID}
                  className="flex w-full min-w-0 flex-col gap-2.5 rounded-xl p-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  <span className="flex items-center gap-2.5">
                    <IconTile
                      icon={BookDashed}
                      selected={selectedId === NO_MANUAL_ID}
                    />
                    <span className="min-w-0 flex-1 text-sm font-semibold leading-snug">
                      {NO_MANUAL_LABEL}
                    </span>
                  </span>
                  <span className="flex justify-center border-t border-slate-400/30 pt-2 dark:border-slate-600/30">
                    <ServicesCount
                      count={unassignedCount}
                      matched={matchCounts !== null}
                    />
                  </span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
