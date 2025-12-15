"use client";

import * as React from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface YearPickerProps {
  value?: number;
  onValueChange?: (year: number | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function YearPicker({
  value,
  onValueChange,
  placeholder = "Selecciona un año",
  className,
  disabled = false,
}: YearPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [viewYear, setViewYear] = React.useState<number>(
    value || new Date().getFullYear()
  );

  // Configuración de años
  const currentYear = new Date().getFullYear();
  const startYear = 1900;
  const endYear = currentYear + 20;

  // Generar años para mostrar (10 años por vista)
  const getYearsInView = (centerYear: number) => {
    const years = [];
    const start = Math.floor((centerYear - 5) / 10) * 10;

    for (let i = 0; i < 12; i++) {
      years.push(start + i);
    }
    return years;
  };

  const yearsInView = React.useMemo(() => {
    return getYearsInView(viewYear);
  }, [viewYear]);

  const handleSelect = (year: number) => {
    onValueChange?.(year);
    setOpen(false);
  };

  const navigateYears = (direction: "prev" | "next") => {
    setViewYear((prev) => (direction === "prev" ? prev - 12 : prev + 12));
  };

  const handleClear = () => {
    onValueChange?.(undefined);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!value}
          className={cn(
            "data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal",
            className
          )}
          disabled={disabled}
        >
          {value ? value : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        {/* Header con navegación */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => navigateYears("prev")}
            disabled={yearsInView[0] <= startYear}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="text-sm font-medium">
            {yearsInView[0]} - {yearsInView[yearsInView.length - 1]}
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => navigateYears("next")}
            disabled={yearsInView[yearsInView.length - 1] >= endYear}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Grid de años */}
        <div className="grid grid-cols-4 gap-1">
          {yearsInView.map((year) => {
            const isSelected = value === year;
            const isCurrentYear = year === currentYear;
            const isDisabled = year < startYear || year > endYear;

            if (isDisabled) {
              return (
                <div
                  key={year}
                  className="h-9 flex items-center justify-center text-sm text-muted-foreground/50"
                >
                  {year}
                </div>
              );
            }

            return (
              <Button
                key={year}
                variant={isSelected ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-9",
                  isSelected && "bg-primary text-primary-foreground",
                  isCurrentYear &&
                    !isSelected &&
                    "border border-primary/30 font-semibold"
                )}
                onClick={() => handleSelect(year)}
              >
                {year}
                {isCurrentYear && !isSelected && (
                  <span className="sr-only"> (Actual)</span>
                )}
              </Button>
            );
          })}
        </div>

        {/* Acciones rápidas */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7"
            onClick={() => handleSelect(currentYear)}
          >
            Año actual
          </Button>

          {value && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 text-destructive hover:text-destructive"
              onClick={handleClear}
            >
              Limpiar
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
