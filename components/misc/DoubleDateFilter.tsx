"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import qs from "query-string";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "../ui/button";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useEffect, useState } from "react";
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
}

const DoubleDateFilter = ({
  initialFirstRange,
  initialSecondRange,
  onDateChange,
}: DoubleDateFilterProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Inicializar estados con los valores de las props
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

  // Sincronizar con cambios en los parámetros de la URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const fromFirst = params.get("from_first");
    const toFirst = params.get("to_first");
    const fromSecond = params.get("from_second");
    const toSecond = params.get("to_second");

    if (fromFirst && toFirst) {
      setFirstRange({
        from: parseISO(fromFirst),
        to: parseISO(toFirst),
      });
    }

    if (fromSecond && toSecond) {
      setSecondRange({
        from: parseISO(fromSecond),
        to: parseISO(toSecond),
      });
    }
  }, [searchParams]);

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

    // Formatear fechas como strings
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

    // Llamar a la función de callback
    onDateChange(ranges);

    // También actualizar la URL directamente
    const query = {
      from_first: ranges.firstRange.start,
      to_first: ranges.firstRange.end,
      from_second: ranges.secondRange.start,
      to_second: ranges.secondRange.end,
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
      // Si el mes seleccionado es anterior al from, intercambiar
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
      // Si el mes seleccionado es anterior al from, intercambiar
      if (month < prev.from) {
        return { from: month, to: prev.from };
      }
      return { ...prev, to: month };
    });
  };

  const resetFilters = () => {
    setFirstRange({});
    setSecondRange({});

    // Limpiar también los parámetros de la URL
    const url = qs.stringifyUrl(
      { url: pathname, query: {} },
      { skipEmptyString: true, skipNull: true }
    );
    router.push(url);
  };

  return (
    <div className="flex flex-col justify-center gap-4">
      <div className="flex justify-center gap-4">
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
        <Button onClick={resetFilters} className="w-90px" variant="outline">
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



