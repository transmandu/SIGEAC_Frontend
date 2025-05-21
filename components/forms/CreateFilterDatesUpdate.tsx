"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import qs from "query-string";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverClose,
} from "@/components/ui/popover";
import { Button } from "../ui/button";
import { format, parseISO, isValid } from "date-fns";
import { formatDateRange } from "@/lib/utils";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { ChevronDown } from "lucide-react";
import { Calendar } from "../ui/calendar";

const DateFilter = () => {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();

  const from = params.get("from");
  const to = params.get("to");

  const paramState = {
    from: from && isValid(parseISO(from)) ? parseISO(from) : undefined,
    to: to && isValid(parseISO(to)) ? parseISO(to) : undefined,
  };

  const [date, setDate] = useState<DateRange | undefined>(paramState);

  const pushToUrl = (dateRange: DateRange | undefined) => {
    const query: Record<string, string> = {};
    
    if (dateRange?.from) {
      query.from = format(dateRange.from, "yyyy-MM-dd");
    }
    if (dateRange?.to) {
      query.to = format(dateRange.to, "yyyy-MM-dd");
    }

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
    setDate(undefined);
    pushToUrl(undefined);
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
          <span>
            {!paramState.from && !paramState.to 
              ? "Filtrado de fechas" 
              : formatDateRange(paramState)}
          </span>
          <ChevronDown className="size-4 mr-2 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="lg:w-auto w-full p-0" align="start">
        <Calendar
          disabled={false}
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={setDate}
          numberOfMonths={2}
        />
        <div className="p-4 w-full flex items-center gap-x-2">
          <PopoverClose asChild>
            <Button
              onClick={onReset}
              disabled={!date?.from && !date?.to}
              className="w-full"
              variant={"outline"}
            >
              Reiniciar
            </Button>
          </PopoverClose>
          <PopoverClose asChild>
            <Button
              onClick={() => pushToUrl(date)}
              disabled={!date?.from || !date?.to}
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