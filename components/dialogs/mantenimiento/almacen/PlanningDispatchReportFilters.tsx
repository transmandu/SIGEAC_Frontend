"use client";

import { Filter, PackageSearch } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
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
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Condition } from "@/types";
import type { DispatchReportArticleOptions } from "@/types/inventory/queues";
import { DispatchReportDateRange } from "./DispatchReportDateRange";
import {
  ARTICLE_CATEGORIES,
  type ArticleCategory,
  type DispatchType,
} from "./DispatchReportFilters";

/* ---------------- TIPOS ---------------- */

interface FieldOption {
  value: string;
  label: string;
}

interface Props {
  startDate?: Date;
  endDate?: Date;
  setStartDate: (d?: Date) => void;
  setEndDate: (d?: Date) => void;
  isDateRangeInvalid: boolean;
  aircraft: string | null;
  setAircraft: (v: string | null) => void;
  aircrafts?: { id: number | string; acronym?: string | null }[];
  isLoadingAircrafts?: boolean;
  workOrder: string | null;
  setWorkOrder: (v: string | null) => void;
  workOrders?: {
    id: number;
    work_order: string;
    work_order_id: number | null;
    aircraft_id: number | null;
  }[];
  isLoadingWorkOrders?: boolean;
  dispatchType: DispatchType | null;
  setDispatchType: (v: DispatchType | null) => void;
  articleCategory: ArticleCategory | null;
  setArticleCategory: (v: ArticleCategory | null) => void;
  conditionId: string | null;
  setConditionId: (v: string | null) => void;
  conditions?: Condition[];
  isLoadingConditions?: boolean;
  articleOptions?: DispatchReportArticleOptions;
  articleFilters: {
    part_number: string;
    description: string;
    variant_type: string;
    brand_model: string;
  };
  setArticleFilters: (v: any) => void;
}

/* ---------------- PIEZAS ---------------- */

const labelClass =
  "text-[11px] font-medium text-muted-foreground uppercase tracking-wide";

const toOptions = (values: string[] | undefined): FieldOption[] =>
  (values ?? []).map((value) => ({ value, label: value }));

/** Selector con etiqueta, "todos" y, si hay muchas opciones, buscador. */
function FilterField({
  label,
  placeholder,
  value,
  onChange,
  options,
  allLabel = "Todos",
  searchable = true,
  disabled,
}: {
  label: string;
  placeholder: string;
  value: string | null;
  onChange: (value: string | null) => void;
  options: FieldOption[];
  allLabel?: string;
  searchable?: boolean;
  disabled?: boolean;
}) {
  const [search, setSearch] = useState("");

  const visible = useMemo(() => {
    const q = search.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, search]);

  return (
    <div className="space-y-1">
      <div className={labelClass}>{label}</div>

      <Select
        value={value || "all"}
        onValueChange={(v) => onChange(v === "all" ? null : v)}
      >
        <SelectTrigger disabled={disabled}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {searchable && (
            <div className="p-2">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder={`Buscar ${label.toLowerCase()}...`}
                className="h-9"
              />
            </div>
          )}

          <SelectItem value="all">{allLabel}</SelectItem>
          {visible.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/** Botón con contador de filtros activos que abre su lista de filtros. */
function FilterPopover({
  icon,
  title,
  hint,
  chips,
  tone,
  children,
}: {
  icon: ReactNode;
  title: string;
  hint: string;
  chips: { label: string; value: string }[];
  tone: "neutral" | "primary";
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full flex justify-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            className={cn(
              "w-[70%] justify-between h-12 text-sm font-medium transition-all border",
              tone === "neutral"
                ? "bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/40 dark:hover:bg-slate-900/60 border-slate-200 dark:border-slate-800"
                : "bg-primary/5 hover:bg-primary/10 border-primary/20",
              open &&
                (tone === "neutral"
                  ? "ring-2 ring-slate-300/40 dark:ring-slate-700/40"
                  : "ring-2 ring-primary/40"),
            )}
          >
            <span className="flex items-center gap-2 text-foreground/80">
              {icon}
              {title}
            </span>

            <div className="flex items-center gap-2">
              {chips.length > 0 ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="w-6 h-6 rounded-full bg-primary text-white text-[11px] flex items-center justify-center font-medium">
                        {chips.length}
                      </div>
                    </TooltipTrigger>

                    <TooltipContent className="text-xs space-y-1">
                      {chips.map((f) => (
                        <div key={f.label}>
                          {f.label}:{" "}
                          <span className="font-medium">{f.value}</span>
                        </div>
                      ))}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <span className="text-xs text-muted-foreground hidden sm:block">
                  {hint}
                </span>
              )}
            </div>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          side="bottom"
          align="center"
          collisionPadding={16}
          className={cn(
            "w-[92vw] max-w-85 space-y-4 p-4",
            "max-h-(--radix-popover-content-available-height) overflow-y-auto",
          )}
        >
          {children}
        </PopoverContent>
      </Popover>
    </div>
  );
}

/* ---------------- COMPONENTE ---------------- */

/**
 * Filtros del reporte de salidas para planificación: aeronave, OT, tipo y
 * categoría del despacho, y los datos del artículo. No lleva destinos
 * administrativos (departamento, empresa, tercero), que no forman parte de
 * lo que planificación consulta.
 */
export function PlanningDispatchReportFilters({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  isDateRangeInvalid,
  aircraft,
  setAircraft,
  aircrafts,
  isLoadingAircrafts,
  workOrder,
  setWorkOrder,
  workOrders = [],
  isLoadingWorkOrders,
  dispatchType,
  setDispatchType,
  articleCategory,
  setArticleCategory,
  conditionId,
  setConditionId,
  conditions,
  isLoadingConditions,
  articleOptions,
  articleFilters,
  setArticleFilters,
}: Props) {
  const setArticleFilter =
    (key: keyof Props["articleFilters"]) => (value: string | null) =>
      setArticleFilters((prev: Props["articleFilters"]) => ({
        ...prev,
        [key]: value ?? "",
      }));

  const aircraftOptions = useMemo<FieldOption[]>(
    () =>
      (aircrafts ?? []).map((a) => ({
        value: String(a.id),
        label: a.acronym ?? `#${a.id}`,
      })),
    [aircrafts],
  );

  // Con una aeronave elegida solo se ofrecen sus OT.
  const workOrderOptions = useMemo<FieldOption[]>(() => {
    const values = workOrders
      .filter((ot) => !aircraft || String(ot.aircraft_id) === String(aircraft))
      .map((ot) => ot.work_order);

    return toOptions([...new Set(values)]);
  }, [workOrders, aircraft]);

  const conditionOptions = useMemo<FieldOption[]>(
    () =>
      (conditions ?? []).map((c) => ({ value: String(c.id), label: c.name })),
    [conditions],
  );

  const generalChips = [
    aircraft && {
      label: "Aeronave",
      value:
        aircraftOptions.find((o) => o.value === String(aircraft))?.label ??
        aircraft,
    },
    workOrder && { label: "OT", value: workOrder },
    dispatchType && {
      label: "Tipo",
      value: dispatchType === "aeronautical" ? "Aeronáutico" : "General",
    },
    articleCategory && {
      label: "Categoría",
      value:
        ARTICLE_CATEGORIES.find((c) => c.value === articleCategory)?.label ??
        articleCategory,
    },
  ].filter(Boolean) as { label: string; value: string }[];

  const articleChips = [
    conditionId && {
      label: "Condición",
      value:
        conditionOptions.find((o) => o.value === String(conditionId))?.label ??
        conditionId,
    },
    articleFilters.part_number && {
      label: "Part Number",
      value: articleFilters.part_number,
    },
    articleFilters.description && {
      label: "Descripción",
      value: articleFilters.description,
    },
    articleFilters.variant_type && {
      label: "Presentación",
      value: articleFilters.variant_type,
    },
    articleFilters.brand_model && {
      label: "Marca",
      value: articleFilters.brand_model,
    },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="space-y-4 py-2 flex flex-col items-center">
      <DispatchReportDateRange
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        isDateRangeInvalid={isDateRangeInvalid}
      />

      <FilterPopover
        tone="neutral"
        icon={<Filter className="w-4 h-4 text-muted-foreground" />}
        title="Filtro General"
        hint="Aeronave / OT / Tipo..."
        chips={generalChips}
      >
        <FilterField
          label="Aeronave"
          placeholder="Seleccionar aeronave"
          value={aircraft}
          options={aircraftOptions}
          allLabel="Todas"
          disabled={isLoadingAircrafts}
          onChange={(next) => {
            setAircraft(next);

            if (
              workOrder &&
              !workOrders.some(
                (ot) =>
                  ot.work_order === workOrder &&
                  (!next || String(ot.aircraft_id) === String(next)),
              )
            ) {
              setWorkOrder(null);
            }
          }}
        />

        <FilterField
          label="Orden de Trabajo"
          placeholder="Seleccionar OT"
          value={workOrder}
          options={workOrderOptions}
          allLabel="Todas"
          disabled={isLoadingWorkOrders}
          onChange={setWorkOrder}
        />

        <FilterField
          label="Tipo de Despacho"
          placeholder="Seleccionar tipo"
          value={dispatchType}
          searchable={false}
          options={[
            { value: "aeronautical", label: "Aeronáutico" },
            { value: "general", label: "General" },
          ]}
          onChange={(next) => {
            setDispatchType(next as DispatchType | null);

            // La categoría solo desglosa el aeronáutico.
            if (next === "general") {
              setArticleCategory(null);
            }
          }}
        />

        {dispatchType !== "general" && (
          <FilterField
            label="Categoría Aeronáutica"
            placeholder="Seleccionar categoría"
            value={articleCategory}
            searchable={false}
            allLabel="Todas"
            options={ARTICLE_CATEGORIES}
            onChange={(next) => {
              setArticleCategory(next as ArticleCategory | null);

              // Elegir una categoría implica despachos aeronáuticos.
              if (next) {
                setDispatchType("aeronautical");
              }
            }}
          />
        )}
      </FilterPopover>

      <FilterPopover
        tone="primary"
        icon={<PackageSearch className="w-4 h-4 text-muted-foreground" />}
        title="Filtro de Artículos"
        hint="Condición / Part / Desc..."
        chips={articleChips}
      >
        <FilterField
          label="Condición"
          placeholder="Seleccionar condición"
          value={conditionId}
          options={conditionOptions}
          allLabel="Todas"
          searchable={false}
          disabled={isLoadingConditions}
          onChange={setConditionId}
        />

        <FilterField
          label="Part Number"
          placeholder="Seleccionar Part Number"
          value={articleFilters.part_number || null}
          options={toOptions(articleOptions?.part_numbers)}
          onChange={setArticleFilter("part_number")}
        />

        {/* Nombre del renglón en los aeronáuticos; descripción en los generales. */}
        <FilterField
          label="Descripción"
          placeholder="Seleccionar descripción"
          value={articleFilters.description || null}
          options={toOptions(articleOptions?.descriptions)}
          onChange={setArticleFilter("description")}
        />

        <FilterField
          label="Present. / Especif."
          placeholder="Seleccionar Present. / Especif."
          value={articleFilters.variant_type || null}
          options={toOptions(articleOptions?.variant_types)}
          onChange={setArticleFilter("variant_type")}
        />

        <FilterField
          label="Marca / Modelo"
          placeholder="Seleccionar marca / modelo"
          value={articleFilters.brand_model || null}
          options={toOptions(articleOptions?.brand_models)}
          onChange={setArticleFilter("brand_model")}
        />
      </FilterPopover>
    </div>
  );
}
