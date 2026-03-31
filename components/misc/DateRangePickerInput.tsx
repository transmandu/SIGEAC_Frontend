"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  parseISO,
  isValid,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";
import { RotateCcw, Search } from "lucide-react";
import { toast } from "sonner";

type ViewMode = "single" | "range";
type Granularity = "day" | "month" | "year";

interface DateRangePickerInputProps {
  onDateChange: (dateRange: { from: Date; to: Date } | undefined) => void;
  onReset?: () => void;
  initialDate?: {
    from: string;
    to: string;
  };
}

const DateRangePickerInput = ({
  onDateChange,
  onReset,
  initialDate,
}: DateRangePickerInputProps) => {
  //Configuracion de la vista
  const [viewMode, setViewMode] = useState<ViewMode>("range");
  const [granularity, setGranularity] = useState<Granularity>("day");

  //Valores de los inputs
  const [singleDate, setSingleDate] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>(initialDate?.from || "");
  const [toDate, setToDate] = useState<string>(initialDate?.to || "");

  const formatValueForInput = (
    dateString: string,
    currentGranularity: Granularity,
  ) => {
    if (currentGranularity === "year") return dateString.substring(0, 4);
    if (currentGranularity === "month") return dateString.substring(0, 7);
    if (currentGranularity === "day") return dateString.substring(0, 10);
    return dateString;
  };

  useEffect(() => {
    if (initialDate) {
      setFromDate(formatValueForInput(initialDate.from, granularity));
      setToDate(formatValueForInput(initialDate.to, granularity));
    }
  }, [initialDate, granularity]);

  //Función para calcular los rangos segun la granularidad
  const calculateExactDate = (value: string, isEnd: boolean) => {
    if (!value) return null;

    let parseDate: Date;

    if (granularity === "year") {
      parseDate = new Date(parseInt(value), 0, 1);
      return isEnd ? endOfYear(parseDate) : startOfYear(parseDate);
    }

    if (granularity === "month") {
      parseDate = parseISO(`${value}-01`); //Se añade el dia 1 para que parseISo no falle
      return isEnd ? endOfMonth(parseDate) : startOfDay(parseDate);
    }

    parseDate = parseISO(value);
    return isEnd ? endOfDay(parseDate) : startOfDay(parseDate);
  };

  const handleSearchClick = () => {
    let finalFrom: Date | null = null;
    let finalTo: Date | null = null;

    if (viewMode === "single") {
      if (!singleDate) return;
      finalFrom = calculateExactDate(singleDate, false);
      finalTo = calculateExactDate(singleDate, true);
    } else {
      if (!fromDate || !toDate) return;
      finalFrom = calculateExactDate(fromDate, false);
      finalTo = calculateExactDate(toDate, true);

      //Evitar que el desde sea mayor que el hasta
      if (finalFrom && finalTo && finalFrom > finalTo) {
        toast.error("Fechas inválidas", {
          description:
            "La fecha de inicio no puede ser mayor a la fecha de fin.",
        });
        return;
      }
    }

    if (finalFrom && finalTo && isValid(finalFrom) && isValid(finalTo)) {
      onDateChange({ from: finalFrom, to: finalTo });
    }
  };

  const handleResetClick = () => {
    setSingleDate("");
    setFromDate("");
    setToDate("");
    if (onReset) onReset();
  };

  const getInputType = () => {
    if (granularity === "year") return "number";
    if (granularity === "month") return "month";
    return "date";
  };

  const getPlaceholder = () => {
    if (granularity === "year") return "Ej: 2026";
    return "";
  };

  return (
    <div className="flex flex-col gap-3 p-3 border rounded-lg bg-card text-card-foreground shadow-sm">
      {/* Modo y granularidad */}

      <div className="flex flex-col items-center gap-2 border-b pb-3 w-full">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Label className="text-sm font-bold mr-2">Modo:</Label>
          <Button
            variant={viewMode === "single" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("single")}
            className="rounded-full px-4 h-8"
          >
            Fecha Única
          </Button>
          <Button
            variant={viewMode === "range" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("range")}
            className="rounded-full px-4 h-8"
          >
            Rango
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <Label className="text-sm font-bold mr-2">Agrupar Por:</Label>
          <Button
            variant={granularity === "day" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setGranularity("day")}
            className="rounded-full h-8"
          >
            Día
          </Button>

          <Button
            variant={granularity === "month" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setGranularity("month")}
            className="rounded-full h-8"
          >
            Mes
          </Button>

          <Button
            variant={granularity === "year" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setGranularity("year")}
            className="rounded-full h-8"
          >
            Año
          </Button>
        </div>
      </div>

      {/* Contenedor de los Inputs Dinámicos y Botones */}

      <div className="flex flex-col gap-3 w-full mt-1">
        {viewMode === "single" ? (
          <div className="flex flex-col gap-1 w-full">
            {" "}
            <Label
              htmlFor="single-date"
              className="text-xs text-muted-foreground"
            >
              Seleccione el{" "}
              {granularity === "day"
                ? "día"
                : granularity === "month"
                  ? "mes"
                  : "año"}
            </Label>
            <Input
              type={getInputType()}
              id="single-date"
              value={singleDate}
              onChange={(e) => setSingleDate(e.target.value)}
              placeholder={getPlaceholder()}
              className="w-full h-9"
            />
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="flex-1 flex flex-col gap-1 w-full">
              {" "}
              <Label
                htmlFor="from-date"
                className="text-xs text-muted-foreground"
              >
                Desde
              </Label>
              <Input
                type={getInputType()}
                id="from-date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                placeholder={getPlaceholder()}
                className="w-full h-9"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1 w-full">
              {" "}
              <Label
                htmlFor="to-date"
                className="text-xs text-muted-foreground"
              >
                Hasta
              </Label>
              <Input
                type={getInputType()}
                id="to-date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                placeholder={getPlaceholder()}
                className="w-full h-9"
              />
            </div>
          </div>
        )}

        {/* Botones de acción */}

        <div className="flex items-center justify-center gap-4 w-full pt-2">
          <Button
            size="sm"
            onClick={handleSearchClick}
            disabled={
              viewMode === "single" ? !singleDate : !fromDate || !toDate
            }
            title="Buscar Estadísticas"
            className="w-32 font-semibold h-9"
          >
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>

          {onReset && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetClick}
              title="Limpiar Filtros"
              className="w-32 font-semibold h-9"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DateRangePickerInput;
