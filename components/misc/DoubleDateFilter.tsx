"use client";

import { usePathname, useRouter } from "next/navigation";
import qs from "query-string";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "../ui/button";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Calendar } from "../ui/calendar";

const DoubleMonthRangeFilter = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [firstRange, setFirstRange] = useState<{ from?: Date; to?: Date }>({});
  const [secondRange, setSecondRange] = useState<{ from?: Date; to?: Date }>(
    {}
  );

  const pushToUrl = () => {
    if (!firstRange.from || !secondRange.from) {
      toast.error("Debes seleccionar al menos un mes en cada selector");
      return;
    }

    // Determinar fechas para el primer selector
    const fromFirst = startOfMonth(firstRange.from);
    const toFirst = firstRange.to
      ? endOfMonth(firstRange.to)
      : endOfMonth(firstRange.from);

    // Determinar fechas para el segundo selector
    const fromSecond = startOfMonth(secondRange.from);
    const toSecond = secondRange.to
      ? endOfMonth(secondRange.to)
      : endOfMonth(secondRange.from);

    // Crear la query
    const query = {
      from_first: format(fromFirst, "yyyy-MM-dd"),
      to_first: format(toFirst, "yyyy-MM-dd"),
      from_second: format(fromSecond, "yyyy-MM-dd"),
      to_second: format(toSecond, "yyyy-MM-dd"),
    };

    const url = qs.stringifyUrl(
      { url: pathname, query },
      { skipEmptyString: true, skipNull: true }
    );
    router.push(url);
  };

  const handleFirstRangeChange = (month?: Date) => {
    if (!month) return;

    setFirstRange((prev) => {
      // Si no hay fecha seleccionada o ya se completó el rango, empezar uno nuevo
      if (!prev.from || prev.to) {
        return { from: month, to: undefined };
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
      return { ...prev, to: month };
    });
  };

  return (
    <div className="flex flex-col justify-center gap-4">
      <div className="flex  justify-center gap-4">
        {/* Primer selector */}
        <Popover>
          <PopoverTrigger asChild>
            <Button className="w-1/3">
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
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Segundo selector */}
        <Popover>
          <PopoverTrigger asChild>
            <Button className="w-1/3">
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
        <Button
          onClick={() => {
            setFirstRange({});
            setSecondRange({});
          }}
          className="w-90px"
          variant="outline"
        >
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

export default DoubleMonthRangeFilter;
