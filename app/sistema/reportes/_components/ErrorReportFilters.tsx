"use client";

import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import DateRangePickerInput from "@/components/misc/DateRangePickerInput";
import { ERROR_REPORT_MODULES } from "@/lib/errorReportModules";
import { ERROR_REPORT_SEVERITIES } from "@/lib/errorReportSeverity";
import { CalendarClock, CalendarCheck2, Search, X, XCircle } from "lucide-react";
import { ErrorReportFilters as Filters } from "@/hooks/sistema/reportes/useGetErrorReports";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "OPEN", label: "ABIERTO" },
  { value: "IN_PROGRESS", label: "En progreso" },
  { value: "RESOLVED", label: "Resuelto" },
];

interface ErrorReportFiltersProps {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
  /** Búsqueda local (no viaja al backend): filtra solo los reportes ya cargados en la página actual. */
  searchValue: string;
  onSearchChange: (value: string) => void;
}

const ALL_VALUE = "all";
const SOFT_TRIGGER =
  "h-9 w-[168px] rounded-xl border-slate-200/80 bg-slate-50/60 text-sm shadow-none dark:border-slate-800/80 dark:bg-slate-900/30";

export default function ErrorReportFilters({
  filters,
  onChange,
  onReset,
  searchValue,
  onSearchChange,
}: ErrorReportFiltersProps) {
  const activeFilterCount = useMemo(() => {
    const { page, per_page, ...rest } = filters;
    return Object.values(rest).filter((v) => v !== undefined && v !== "").length;
  }, [filters]);

  return (
    <div className="space-y-2.5">
      {/* Buscador (filtra localmente los reportes ya cargados en esta página) */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar en esta página por descripción, módulo, reportado por, teléfono o código HTTP..."
          className="h-10 rounded-xl border-slate-200/80 bg-slate-50/60 pl-9 pr-9 text-sm shadow-none dark:border-slate-800/80 dark:bg-slate-900/30"
        />
        {searchValue && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            aria-label="Limpiar búsqueda"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.status ?? ALL_VALUE}
          onValueChange={(value) =>
            onChange({ status: value === ALL_VALUE ? undefined : (value as Filters["status"]) })
          }
        >
          <SelectTrigger className={SOFT_TRIGGER}>
            <SelectValue placeholder="Estatus" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>Todos los estatus</SelectItem>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.module ?? ALL_VALUE}
          onValueChange={(value) => onChange({ module: value === ALL_VALUE ? undefined : value })}
        >
          <SelectTrigger className={SOFT_TRIGGER}>
            <SelectValue placeholder="Módulo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>Todos los módulos</SelectItem>
            {ERROR_REPORT_MODULES.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.severity ?? ALL_VALUE}
          onValueChange={(value) =>
            onChange({ severity: value === ALL_VALUE ? undefined : (value as Filters["severity"]) })
          }
        >
          <SelectTrigger className={SOFT_TRIGGER}>
            <SelectValue placeholder="Severidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>Todas las severidades</SelectItem>
            {ERROR_REPORT_SEVERITIES.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-9 gap-1.5 rounded-xl border-slate-200/80 bg-slate-50/60 font-normal shadow-none dark:border-slate-800/80 dark:bg-slate-900/30",
                filters.from && filters.to && "border-indigo-300 text-indigo-700 dark:border-indigo-500/40 dark:text-indigo-300"
              )}
            >
              <CalendarClock className="h-3.5 w-3.5" />
              Fecha de reporte
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <DateRangePickerInput
              initialDate={filters.from && filters.to ? { from: filters.from, to: filters.to } : undefined}
              onDateChange={(range) =>
                onChange({
                  from: range?.from.toISOString(),
                  to: range?.to.toISOString(),
                })
              }
              onReset={() => onChange({ from: undefined, to: undefined })}
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-9 gap-1.5 rounded-xl border-slate-200/80 bg-slate-50/60 font-normal shadow-none dark:border-slate-800/80 dark:bg-slate-900/30",
                filters.resolved_from && filters.resolved_to && "border-indigo-300 text-indigo-700 dark:border-indigo-500/40 dark:text-indigo-300"
              )}
            >
              <CalendarCheck2 className="h-3.5 w-3.5" />
              Fecha de resolución
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <DateRangePickerInput
              initialDate={
                filters.resolved_from && filters.resolved_to
                  ? { from: filters.resolved_from, to: filters.resolved_to }
                  : undefined
              }
              onDateChange={(range) =>
                onChange({
                  resolved_from: range?.from.toISOString(),
                  resolved_to: range?.to.toISOString(),
                })
              }
              onReset={() => onChange({ resolved_from: undefined, resolved_to: undefined })}
            />
          </PopoverContent>
        </Popover>

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-9 gap-1.5 rounded-xl text-muted-foreground hover:text-destructive"
          >
            <XCircle className="h-3.5 w-3.5" />
            Limpiar filtros
            <span className="select-none ml-0.5 rounded-full bg-slate-200/80 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-700/60 dark:text-slate-300">
              {activeFilterCount}
            </span>
          </Button>
        )}
      </div>
    </div>
  );
}
