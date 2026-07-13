"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import DateRangePickerInput from "@/components/misc/DateRangePickerInput";
import { ERROR_REPORT_MODULES } from "@/lib/errorReportModules";
import { ERROR_REPORT_SEVERITIES } from "@/lib/errorReportSeverity";
import { ListRestart } from "lucide-react";
import { ErrorReportFilters as Filters } from "@/hooks/sistema/reportes/useGetErrorReports";

const STATUS_OPTIONS = [
  { value: "OPEN", label: "Abierto" },
  { value: "IN_PROGRESS", label: "En progreso" },
  { value: "RESOLVED", label: "Resuelto" },
];

interface ErrorReportFiltersProps {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
}

const ALL_VALUE = "all";

export default function ErrorReportFilters({
  filters,
  onChange,
  onReset,
}: ErrorReportFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={filters.status ?? ALL_VALUE}
        onValueChange={(value) =>
          onChange({ status: value === ALL_VALUE ? undefined : (value as Filters["status"]) })
        }
      >
        <SelectTrigger className="w-[160px]">
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
        <SelectTrigger className="w-[160px]">
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
        <SelectTrigger className="w-[160px]">
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
          <Button variant="outline" size="sm">
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
          <Button variant="outline" size="sm">
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

      <Button variant="ghost" size="sm" onClick={onReset}>
        <ListRestart className="mr-2 h-4 w-4" />
        Reiniciar filtros
      </Button>
    </div>
  );
}
