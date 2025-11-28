"use client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "../ui/button";
import { format, parseISO, startOfMonth, endOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { formatDateRange } from "@/lib/utils";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { ChevronDown } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { PopoverClose } from "@radix-ui/react-popover";

interface Period {
  from: Date;
  to: Date;
}

interface DateFilterProps {
  onDateChange: (dateRange: { from: Date; to: Date } | undefined) => void;
  onReset?: () => void;
  initialDate?: {
    from: string;
    to: string;
  };
}

const DateFilter = ({
  onDateChange,
  onReset,
  initialDate,
}: DateFilterProps) => {
  const defaultFrom = startOfMonth(new Date());
  const defaultTo = endOfDay(new Date());

  // Convertir fechas iniciales de string a Date
  const initialDateRange = initialDate
    ? {
        from: parseISO(initialDate.from),
        to: parseISO(initialDate.to),
      }
    : {
        from: defaultFrom,
        to: defaultTo,
      };

  const [date, setDate] = useState<DateRange | undefined>(initialDateRange);
  const [tempDate, setTempDate] = useState<DateRange | undefined>(
    initialDateRange
  );

  const handleApply = () => {
    setDate(tempDate);
    if (tempDate?.from && tempDate?.to) {
      onDateChange({ from: tempDate.from, to: tempDate.to });
    }
  };

  const handleReset = () => {
    setTempDate(undefined);
    setDate(undefined);
    if (onReset) {
      onReset();
    }
  };

  const convertDateRangeToPeriod = (
    dateRange: DateRange | undefined
  ): Period | undefined => {
    if (dateRange && dateRange.from && dateRange.to) {
      return { from: dateRange.from, to: dateRange.to };
    }
    return undefined;
  };

  const handleDateChange = (newDate: DateRange | undefined) => {
    setTempDate(newDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          disabled={false}
          size={"sm"}
          variant={"outline"}
          className="lg:w-auto w-full h-9 rounded-md px-3 font-normal bg-primary hover:bg-primary/90 hover:text-white border-none focus:ring-offset-0 focus:ring-transparent outline-none text-white focus:bg-blue-700/50 transition"
        >
          <span>
            {convertDateRangeToPeriod(date || initialDateRange)
              ? formatDateRange(
                  convertDateRangeToPeriod(date || initialDateRange)!
                )
              : "Seleccionar rango"}
          </span>
          <ChevronDown className="size-4 mr-2 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="lg:w-auto w-full p-0" align="start">
        <Calendar
          disabled={false}
          initialFocus
          mode="range"
          defaultMonth={tempDate?.from}
          selected={tempDate}
          onSelect={handleDateChange}
          numberOfMonths={2}
          locale={es}
          fromYear={2000}
          toYear={new Date().getFullYear()}
          captionLayout="dropdown-buttons"
          components={{
            Dropdown: (props) => (
              <select {...props} className="bg-popover text-popover-foreground">
                {props.children}
              </select>
            ),
          }}
        />
        <div className="p-4 w-full flex items-center gap-x-2">
          <PopoverClose asChild>
            <Button
              onClick={handleReset}
              disabled={!tempDate?.from || !tempDate?.to}
              className="w-full"
              variant={"outline"}
            >
              Reiniciar
            </Button>
          </PopoverClose>
          <PopoverClose asChild>
            <Button
              onClick={handleApply}
              disabled={!tempDate?.from || !tempDate?.to}
              className="w-full"
            >
              Aplicar
            </Button>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DateFilter;
