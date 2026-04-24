"use client";
import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MonthYearPickerProps {
  month: number;
  year: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  className?: string;
  disabled?: boolean;
}

export function MonthYearPicker({
  month,
  year,
  onMonthChange,
  onYearChange,
  className,
  disabled = false,
}: MonthYearPickerProps) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(year);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const getMonthName = (m: number) => {
    const date = new Date(2000, m - 1, 1);
    const name = format(date, "MMM", { locale: es });
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const handleMonthSelect = (selectedMonth: number) => {
    onMonthChange(selectedMonth);
    onYearChange(viewYear);
    setOpen(false);
  };

  const currentMonthName = getMonthName(month);

  return (
    <Popover
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (isOpen) setViewYear(year);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[180px] justify-start text-left font-medium bg-background border-input shadow-sm",
            className,
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 opacity-50" />
          {currentMonthName} {year}
        </Button>
      </PopoverTrigger>
      {/* Navegador de Años */}
      <PopoverContent className="w-[260px] p-3" align="start">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => setViewYear((prev) => prev - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="text-sm font-bold tracking-wider"> {viewYear} </div>

          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => setViewYear((prev) => prev + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Navegador de Meses */}
        <div className="grid grod-cols-3 gap-2">
          {months.map((m) => {
            const isSelected = m === month && viewYear === year;
            return (
              <Button
                key={m}
                variant={isSelected ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-9 text-xs font-semibold uppercase",
                  isSelected && "bg-primary text-primary-foreground shadow-md",
                )}
                onClick={() => handleMonthSelect(m)}
              >
                {getMonthName(m).slice(0, 3)}
              </Button>
            );
          })}
        </div>

        {/* Boton de acción rápida */}
        <div className="mt-4 pt-3 border-t border-border/50">
          <Button
            variant="secondary"
            size="sm"
            className="w-full text-xs font-semibold h-8"
            onClick={() => {
              const now = new Date();
              onMonthChange(now.getMonth() + 1);
              onYearChange(now.getFullYear());
              setOpen(false);
            }}
          >
            Ir al mes actual
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
