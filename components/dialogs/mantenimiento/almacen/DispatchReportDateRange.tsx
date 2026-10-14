"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertCircle,
  Calendar as CalendarIcon,
  CalendarDays,
  CalendarX,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Props {
  startDate?: Date;
  endDate?: Date;
  setStartDate: (d?: Date) => void;
  setEndDate: (d?: Date) => void;
  isDateRangeInvalid: boolean;
}

/** Rango de fechas del reporte; lo comparten los filtros de almacén y de planificación. */
export function DispatchReportDateRange({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  isDateRangeInvalid,
}: Props) {
  const [calendarMonth, setCalendarMonth] = useState<Date>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );

  return (
    <div className="p-4 border rounded-2xl bg-muted/20 dark:bg-muted/10 space-y-3 w-full mb-4">
      <div className="flex items-center gap-2 text-foreground/80">
        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">Rango de Fechas</span>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <div className="flex justify-center w-full">
            <Button
              variant="outline"
              className="w-[320px] mx-auto justify-center text-center gap-2 h-11 px-4 border border-dashed border-slate-300/60 dark:border-slate-700/40 bg-background/60 backdrop-blur-sm font-medium text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-900/40"
            >
              <CalendarDays className="w-4 h-4 text-muted-foreground" />

              {startDate && endDate ? (
                startDate.getTime() === endDate.getTime() ? (
                  <span className="text-center whitespace-nowrap">
                    {format(startDate, "dd MMM yyyy", { locale: es })}
                  </span>
                ) : (
                  <span className="text-center whitespace-nowrap">
                    {format(startDate, "dd MMM yyyy", { locale: es })} —{" "}
                    {format(endDate, "dd MMM yyyy", { locale: es })}
                  </span>
                )
              ) : (
                <span className="text-center text-muted-foreground whitespace-nowrap">
                  Seleccionar rango de fechas
                </span>
              )}
            </Button>
          </div>
        </PopoverTrigger>

        <PopoverContent
          align="center"
          side="bottom"
          sideOffset={10}
          className="p-3 w-auto min-w-[320px] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl backdrop-blur-sm bg-white/90 dark:bg-slate-950/90"
        >
          {/* ================= PRESETS ================= */}
          <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
            {[
              {
                label: "7D",
                tooltip: "Últimos 7 días",
                fn: () => {
                  const end = new Date();
                  const start = new Date();
                  start.setDate(end.getDate() - 7);

                  setStartDate(start);
                  setEndDate(end);
                  setCalendarMonth(start);
                },
              },
              {
                label: "30D",
                tooltip: "Últimos 30 días",
                fn: () => {
                  const end = new Date();
                  const start = new Date();
                  start.setDate(end.getDate() - 30);

                  setStartDate(start);
                  setEndDate(end);
                  setCalendarMonth(start);
                },
              },
              {
                label:
                  calendarMonth.getMonth() === new Date().getMonth() &&
                  calendarMonth.getFullYear() === new Date().getFullYear()
                    ? "MES"
                    : format(calendarMonth, "MMM yyyy", {
                        locale: es,
                      }).toUpperCase(),

                tooltip: "Mes visible en el calendario",

                fn: () => {
                  const today = new Date();

                  const start = new Date(
                    calendarMonth.getFullYear(),
                    calendarMonth.getMonth(),
                    1,
                  );

                  const isCurrentMonth =
                    calendarMonth.getMonth() === today.getMonth() &&
                    calendarMonth.getFullYear() === today.getFullYear();

                  const end = isCurrentMonth
                    ? today
                    : new Date(
                        calendarMonth.getFullYear(),
                        calendarMonth.getMonth() + 1,
                        0,
                      );

                  setStartDate(start);
                  setEndDate(end);
                  setCalendarMonth(start);
                },
              },
            ].map((p) => (
              <TooltipProvider key={p.label} delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 px-2 h-7"
                      onClick={p.fn}
                    >
                      {p.label}
                    </Button>
                  </TooltipTrigger>

                  <TooltipContent className="text-xs" sideOffset={6}>
                    {p.tooltip}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                    onClick={() => {
                      setStartDate(undefined);
                      setEndDate(undefined);
                    }}
                  >
                    <CalendarX className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="text-xs">
                  Limpiar rango
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* ================= CALENDAR ================= */}
          <div className="scale-[0.95] origin-top">
            <Calendar
              mode="range"
              selected={{ from: startDate, to: endDate }}
              month={calendarMonth}
              onMonthChange={setCalendarMonth}
              onSelect={(range: any) => {
                const from = range?.from;
                const to = range?.to;

                if (!from) {
                  setStartDate(undefined);
                  setEndDate(undefined);
                  return;
                }

                if (!to) {
                  setStartDate(from);
                  setEndDate(from);
                  setCalendarMonth(from);
                  return;
                }

                setStartDate(from);
                setEndDate(to);
                setCalendarMonth(from);
              }}
              numberOfMonths={
                startDate && endDate
                  ? startDate.getMonth() !== endDate.getMonth() ||
                    startDate.getFullYear() !== endDate.getFullYear()
                    ? 2
                    : 1
                  : 1
              }
              showOutsideDays={false}
              endMonth={new Date()}
              locale={es}
              disabled={(d) => d > new Date()}
              className={cn(
                "rounded-xl",
                "[&_.rdp-day_selected]:bg-slate-200",
                "[&_.rdp-day_selected]:text-slate-900",
                "[&_.rdp-day_range_middle]:bg-slate-100",
                "[&_.rdp-day_range_middle]:text-slate-900",
                "[&_.rdp-day_range_start]:bg-slate-300",
                "[&_.rdp-day_range_end]:bg-slate-300",
              )}
              formatters={{
                formatCaption: (date) =>
                  format(date, "MMMM yyyy", { locale: es }).toUpperCase(),
              }}
            />
          </div>
        </PopoverContent>
      </Popover>

      {isDateRangeInvalid && (
        <div className="flex items-center gap-2 text-xs text-red-500">
          <AlertCircle className="w-3 h-3" />
          Rango de fechas inválido
        </div>
      )}
    </div>
  );
}
