"use client";

import { ListFilter } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ALERT_CATEGORIES,
  ALL,
  CONTROL_LABELS,
  CONTROL_STATUS_LABELS,
  type AlertFacets,
  type AlertFilters,
} from "@/hooks/alerts/filters";

const selectTriggerClass =
  "h-8 w-full min-w-0 px-2.5 text-xs max-sm:h-10 max-sm:text-base bg-white/80 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-700/60";

/**
 * Filtros del panel de alertas críticas: un selector por tipo de alerta y, al
 * elegir "Controles", los que afinan por aeronave, control y estado. Solo se
 * dibuja cuando hay algo que separar: con una sola categoría a la vista (lo
 * normal para quien recibe un único tipo de alerta) el panel queda como antes.
 */
export function CriticalAlertsFilterBar({
  facets,
  filters,
  total,
  onChange,
}: {
  facets: AlertFacets;
  filters: AlertFilters;
  total: number;
  onChange: (filters: AlertFilters) => void;
}) {
  if (facets.categories.length < 2) return null;

  const showControlFilters = filters.category === "control";
  const hasAircraft = facets.aircraft.length > 1;
  const hasControls = facets.controls.length > 1;
  const hasStatuses = facets.statuses.length > 1;

  return (
    <div className="shrink-0 space-y-2 border-b bg-muted/30 px-3 py-2">
      <Select
        value={filters.category}
        onValueChange={(category) =>
          onChange({
            ...filters,
            category: category as AlertFilters["category"],
          })
        }
      >
        <SelectTrigger
          className={selectTriggerClass}
          aria-label="Filtrar alertas por tipo"
        >
          <SelectValue placeholder="Tipo de alerta" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL} suffix={total}>
            <span className="inline-flex items-center gap-2">
              <ListFilter className="size-3.5 text-muted-foreground" />
              Todas las alertas
            </span>
          </SelectItem>
          {facets.categories.map(({ key, count }) => {
            const { label, icon: Icon } = ALERT_CATEGORIES[key];

            return (
              <SelectItem key={key} value={key} suffix={count}>
                <span className="inline-flex items-center gap-2">
                  <Icon className="size-3.5 text-muted-foreground" />
                  {label}
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {showControlFilters && (hasAircraft || hasControls || hasStatuses) && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:[&>*:last-child:nth-child(odd)]:col-span-2">
          {hasAircraft && (
            <Select
              value={filters.aircraft}
              onValueChange={(aircraft) => onChange({ ...filters, aircraft })}
            >
              <SelectTrigger
                className={selectTriggerClass}
                aria-label="Filtrar por aeronave"
              >
                <SelectValue placeholder="Aeronave" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todas las aeronaves</SelectItem>
                {facets.aircraft.map((acronym) => (
                  <SelectItem key={acronym} value={acronym}>
                    {acronym}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {hasStatuses && (
            <Select
              value={filters.status}
              onValueChange={(status) =>
                onChange({
                  ...filters,
                  status: status as AlertFilters["status"],
                })
              }
            >
              <SelectTrigger
                className={selectTriggerClass}
                aria-label="Filtrar por estado"
              >
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos los estados</SelectItem>
                {facets.statuses.map(({ key, count }) => (
                  <SelectItem key={key} value={key} suffix={count}>
                    {CONTROL_STATUS_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {hasControls && (
            <Select
              value={filters.control}
              onValueChange={(control) =>
                onChange({
                  ...filters,
                  control: control as AlertFilters["control"],
                })
              }
            >
              <SelectTrigger
                className={selectTriggerClass}
                aria-label="Filtrar por control"
              >
                <SelectValue placeholder="Control" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos los controles</SelectItem>
                {facets.controls.map(({ key, count }) => (
                  <SelectItem key={key} value={key} suffix={count}>
                    {CONTROL_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}
    </div>
  );
}
