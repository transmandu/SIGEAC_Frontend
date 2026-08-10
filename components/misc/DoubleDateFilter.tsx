"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "../ui/button";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Calendar } from "../ui/calendar";

interface DoubleDateFilterProps {
  initialFirstRange?: { start: string; end: string };
  initialSecondRange?: { start: string; end: string };
  onDateChange: (ranges: {
    firstRange: { start: string; end: string };
    secondRange: { start: string; end: string };
  }) => void;
  onReset?: () => void; 
}

const DoubleDateFilter = ({
  initialFirstRange,
  initialSecondRange,
  onDateChange,
  onReset, 
}: DoubleDateFilterProps) => {
  const [firstRange, setFirstRange] = useState<{ from?: Date; to?: Date }>(
    () => {
      if (initialFirstRange) {
        return {
          from: parseISO(initialFirstRange.start),
          to: parseISO(initialFirstRange.end),
        };
      }
      return {};
    }
  );

  const [secondRange, setSecondRange] = useState<{ from?: Date; to?: Date }>(
    () => {
      if (initialSecondRange) {
        return {
          from: parseISO(initialSecondRange.start),
          to: parseISO(initialSecondRange.end),
        };
      }
      return {};
    }
  );

  const pushToUrl = () => {
    if (!firstRange.from || !secondRange.from) {
      toast.error("Debes seleccionar al menos un mes en cada selector");
      return;
    }

    const fromFirst = startOfMonth(firstRange.from);
    const toFirst = firstRange.to
      ? endOfMonth(firstRange.to)
      : endOfMonth(firstRange.from);

    const fromSecond = startOfMonth(secondRange.from);
    const toSecond = secondRange.to
      ? endOfMonth(secondRange.to)
      : endOfMonth(secondRange.from);

    const ranges = {
      firstRange: {
        start: format(fromFirst, "yyyy-MM-dd"),
        end: format(toFirst, "yyyy-MM-dd"),
      },
      secondRange: {
        start: format(fromSecond, "yyyy-MM-dd"),
        end: format(toSecond, "yyyy-MM-dd"),
      },
    };

    onDateChange(ranges);
  };

  const handleFirstRangeChange = (month?: Date) => {
    if (!month) return;

    setFirstRange((prev) => {
      if (!prev.from || prev.to) {
        return { from: month, to: undefined };
      }
      if (month < prev.from) {
        return { from: month, to: prev.from };
      }
      return { ...prev, to: month };
    });
  };

  const handleSecondRangeChange = (month?: Date) => {
    if (!month) return;

    setSecondRange((prev) => {
      if (!prev.from || prev.to) {
        return { from: month, to: undefined };
      }
      if (month < prev.from) {
        return { from: month, to: prev.from };
      }
      return { ...prev, to: month };
    });
  };

  const handleReset = () => {
    setFirstRange({});
    setSecondRange({});

    if (onReset) {
      onReset();
    }
  };

  return (
    <div className="flex flex-col justify-center gap-4">
      <div className="flex flex-col xl:flex-row items-center justify-center gap-4">
        {/* Primer selector */}
        <Popover>
          <PopoverTrigger asChild>
            <Button className="w-full sm:w-1/3">
              <span>
                {firstRange.from
                  ? `${format(firstRange.from, "MMMM yyyy", { locale: es })} ${
                      firstRange.to
                        ? `- ${format(firstRange.to, "MMMM yyyy", {
                            locale: es,
                          })}`
                        : ""
                    }`
                  : "Seleccionar Mes o Rango 1"}
              </span>
              <ChevronDown className="size-4 ml-2 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Calendar
              mode="single"
              selected={firstRange.to || firstRange.from}
              onSelect={handleFirstRangeChange}
              locale={es}
              className="rounded-md border shadow-sm"
              captionLayout="dropdown-buttons"
              fromYear={2000}
              toYear={new Date().getFullYear()}
              components={{
                Dropdown: (props) => (
                  <select {...props} className="bg-popover text-popover-foreground">
                    {props.children}
                  </select>
                ),
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Segundo selector */}
        <Popover>
          <PopoverTrigger asChild>
            <Button className="w-full sm:w-1/3">
              <span>
                {secondRange.from
                  ? `${format(secondRange.from, "MMMM yyyy", { locale: es })} ${
                      secondRange.to
                        ? `- ${format(secondRange.to, "MMMM yyyy", {
                            locale: es,
                          })}`
                        : ""
                    }`
                  : "Seleccionar Mes o Rango 2"}
              </span>
              <ChevronDown className="size-4 ml-2 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Calendar
              mode="single"
              selected={secondRange.to || secondRange.from}
              onSelect={handleSecondRangeChange}
              locale={es}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      {/* Botones */}
      <div className="flex justify-center items-center gap-2">
        <Button onClick={handleReset} className="w-90px" variant="outline">
          Reiniciar
        </Button>
        <Button
          onClick={pushToUrl}
          className="w-90px"
          disabled={!firstRange.from || !secondRange.from}
        >
          Aplicar
        </Button>
      </div>
    </div>
  );
};

export default DoubleDateFilter;
