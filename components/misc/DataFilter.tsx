"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import qs from "query-string";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "../ui/button";
import { format, parseISO, startOfMonth, endOfDay } from "date-fns";
import { es } from "date-fns/locale"; // Importa la localización en español
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

const DateFilter = () => {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();

  const from = params.get("from") || "";
  const to = params.get("to") || "";

  const defaultFrom = startOfMonth(new Date());
  const defaultTo = endOfDay(new Date());

  const initialDate = {
    from: from ? parseISO(from) : defaultFrom,
    to: to ? parseISO(to) : defaultTo,
  };

  const [date, setDate] = useState<DateRange | undefined>(initialDate);
  const [tempDate, setTempDate] = useState<DateRange | undefined>(initialDate);

  const pushToUrl = (dateRange: DateRange | undefined) => {
    const query = {
      from: format(dateRange?.from || defaultFrom, "yyyy-MM-dd"),
      to: format(dateRange?.to || defaultTo, "yyyy-MM-dd"),
    };

    const url = qs.stringifyUrl(
      {
        url: pathname,
        query,
      },
      { skipEmptyString: true, skipNull: true }
    );

    router.push(url);
  };

  const onReset = () => {
    setTempDate(undefined);
    setDate(undefined);
  };

  const onApply = () => {
    setDate(tempDate);
    pushToUrl(tempDate);
  };

  const convertDateRangeToPeriod = (dateRange: DateRange | undefined): Period | undefined => {
    if (dateRange && dateRange.from && dateRange.to) {
      return { from: dateRange.from, to: dateRange.to };
    }
    return undefined;
  };

  const handleDateChange = (newDate: DateRange | undefined) => {
    setTempDate(newDate);
    setDate(newDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          disabled={false}
          size={"sm"}
          variant={"outline"}
          className="lg:w-auto w-full h-9 rounded-md px-3 font-normal bg-primary hover:bg-primary/90 hover:text-white border-none focus:ring-offset-0 focus:ring-transparent outline-none text-white focus:bg-white/30 transition"
        >
          <span>{convertDateRangeToPeriod(date || initialDate) ? formatDateRange(convertDateRangeToPeriod(date || initialDate)!) : "Seleccionar rango"}</span>
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
          locale={es} // Pasa la localización en español
        />
        <div className="p-4 w-full flex items-center gap-x-2">
          <PopoverClose asChild>
            <Button
              onClick={onReset}
              disabled={!tempDate?.from || !tempDate?.to}
              className="w-full"
              variant={"outline"}
            >
              Reiniciar
            </Button>
          </PopoverClose>
          <PopoverClose asChild>
            <Button
              onClick={onApply}
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