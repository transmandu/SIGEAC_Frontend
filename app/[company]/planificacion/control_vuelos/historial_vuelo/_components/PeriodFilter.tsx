"use client";

import { Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CardTitle } from "@/components/ui/card";

export type PeriodType = "current_month" | "month" | "year" | "custom";

interface PeriodFilterProps {
  periodType: PeriodType;
  onPeriodTypeChange: (value: PeriodType) => void;
  selectedMonth: string;
  onMonthChange: (value: string) => void;
  selectedYear: string;
  onYearChange: (value: string) => void;
  customFrom: string;
  onCustomFromChange: (value: string) => void;
  customTo: string;
  onCustomToChange: (value: string) => void;
}

const PeriodFilter = ({
  periodType,
  onPeriodTypeChange,
  selectedMonth,
  onMonthChange,
  selectedYear,
  onYearChange,
  customFrom,
  onCustomFromChange,
  customTo,
  onCustomToChange,
}: PeriodFilterProps) => {
  return (
    <>
      <CardTitle className="flex items-center gap-2">
        <Calendar className="h-5 w-5" />
        Filtro por Período
      </CardTitle>

      <div className="space-y-4">
        <Select
          value={periodType}
          onValueChange={(v) => onPeriodTypeChange(v as PeriodType)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current_month">Mes actual</SelectItem>
            <SelectItem value="month">Mes específico</SelectItem>
            <SelectItem value="year">Año completo</SelectItem>
            <SelectItem value="custom">Rango personalizado</SelectItem>
          </SelectContent>
        </Select>

        {periodType === "month" && (
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="h-10 w-full rounded-md border px-3"
          />
        )}

        {periodType === "year" && (
          <Select value={selectedYear} onValueChange={onYearChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }).map((_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        )}

        {periodType === "custom" && (
          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => onCustomFromChange(e.target.value)}
              className="h-10 rounded-md border px-3"
            />
            <input
              type="date"
              value={customTo}
              onChange={(e) => onCustomToChange(e.target.value)}
              className="h-10 rounded-md border px-3"
            />
          </div>
        )}
      </div>
    </>
  );
};

export default PeriodFilter;
