"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, startOfMonth, startOfYear, subDays, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Check, ChevronRight, X } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";

export type Period = {
  from?: Date;
  to?: Date;
  label: string;
};

const today = () => new Date();

const PRESETS: { label: string; build: () => Period }[] = [
  {
    label: "Últimos 30 días",
    build: () => ({
      from: subDays(today(), 30),
      to: today(),
      label: "Últimos 30 días",
    }),
  },
  {
    label: "Últimos 3 meses",
    build: () => ({
      from: subMonths(today(), 3),
      to: today(),
      label: "Últimos 3 meses",
    }),
  },
  {
    label: "Últimos 12 meses",
    build: () => ({
      from: subMonths(today(), 12),
      to: today(),
      label: "Últimos 12 meses",
    }),
  },
  {
    label: "Mes actual",
    build: () => ({
      from: startOfMonth(today()),
      to: today(),
      label: "Mes actual",
    }),
  },
  {
    label: "Año actual",
    build: () => ({
      from: startOfYear(today()),
      to: today(),
      label: "Año actual",
    }),
  },
  { label: "Todo el histórico", build: () => ({ label: "Todo el histórico" }) },
];

export const formatPeriodRange = (period: Period) => {
  if (!period.from && !period.to) return "Todo el histórico";

  const from = period.from
    ? format(period.from, "dd/MM/yyyy", { locale: es })
    : "inicio";
  const to = period.to ? format(period.to, "dd/MM/yyyy", { locale: es }) : "hoy";

  return `${from} — ${to}`;
};

export const PeriodFilter = ({
  value,
  onChange,
}: {
  value: Period;
  onChange: (period: Period) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [custom, setCustom] = useState<DateRange | undefined>(
    value.from ? { from: value.from, to: value.to } : undefined,
  );

  const isCustom = value.label === "Personalizado";

  // El calendario solo se despliega bajo pedido: apilado con los presets el
  // popover superaba el alto de la ventana y se recortaba.
  const openPanel = (next: boolean) => {
    setOpen(next);
    if (!next) setShowCalendar(false);
  };

  const applyCustom = (range: DateRange | undefined) => {
    setCustom(range);

    if (range?.from && range.to) {
      onChange({ from: range.from, to: range.to, label: "Personalizado" });
      setOpen(false);
      setShowCalendar(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={openPanel}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-2">
          <CalendarIcon className="size-3.5" />
          <span className="text-xs font-medium">
            {isCustom ? formatPeriodRange(value) : value.label}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        collisionPadding={12}
        className="flex w-auto p-0"
      >
        <div className="flex w-44 flex-col p-1">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                onChange(preset.build());
                setCustom(undefined);
                setShowCalendar(false);
                setOpen(false);
              }}
              className={cn(
                "flex items-center justify-between gap-3 rounded-sm px-2 py-1.5 text-left text-xs transition-colors hover:bg-accent",
                value.label === preset.label && "bg-accent/60 font-semibold",
              )}
            >
              {preset.label}
              {value.label === preset.label && (
                <Check className="size-3.5 shrink-0" />
              )}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setShowCalendar((previous) => !previous)}
            className={cn(
              "mt-1 flex items-center justify-between gap-3 rounded-sm border-t px-2 pb-1.5 pt-2 text-left text-xs transition-colors hover:bg-accent",
              isCustom && "font-semibold",
            )}
          >
            Rango personalizado
            <ChevronRight
              className={cn(
                "size-3.5 shrink-0 transition-transform",
                showCalendar && "rotate-90",
              )}
            />
          </button>

          {(value.from || value.to) && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 h-7 w-full justify-start px-2 text-xs text-muted-foreground"
              onClick={() => {
                onChange({ label: "Todo el histórico" });
                setCustom(undefined);
                setShowCalendar(false);
                setOpen(false);
              }}
            >
              <X className="mr-1.5 size-3.5" />
              Limpiar período
            </Button>
          )}
        </div>

        {showCalendar && (
          <div className="border-l p-2">
            <Calendar
              mode="range"
              locale={es}
              selected={custom}
              onSelect={applyCustom}
              numberOfMonths={1}
              defaultMonth={custom?.from}
            />
            <p className="px-1 pb-1 text-[11px] text-muted-foreground">
              {custom?.from && !custom.to
                ? "Elija la fecha final."
                : "Elija la fecha inicial y la final."}
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
