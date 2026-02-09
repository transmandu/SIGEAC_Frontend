import { useState } from "react";
import { useDateRangeCalculator } from "./useDateRangeCalculator";
import { PeriodType } from "@/app/[company]/planificacion/control_vuelos/historial_vuelo/_components/PeriodFilter";

export const useFlightFilters = () => {
  const [selectedAcronym, setSelectedAcronym] = useState<string>("");
  const [periodType, setPeriodType] = useState<PeriodType>("current_month");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7), // yyyy-MM
  );
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString(),
  );
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const dateRange = useDateRangeCalculator({
    periodType,
    selectedMonth,
    selectedYear,
    customFrom,
    customTo,
  });

  const clearFilters = () => {
    setSelectedAcronym("");
    setPeriodType("current_month");
    setSelectedMonth(new Date().toISOString().slice(0, 7));
    setSelectedYear(new Date().getFullYear().toString());
    setCustomFrom("");
    setCustomTo("");
  };

  const hasCustomDateError =
    periodType === "custom" && (!customFrom || !customTo);
  const isFilterActive =
    selectedAcronym !== "" || periodType !== "current_month";

  return {
    // Estados
    selectedAcronym,
    setSelectedAcronym,
    periodType,
    setPeriodType,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    customFrom,
    setCustomFrom,
    customTo,
    setCustomTo,

    // Resultado calculado
    dateRange,

    // Métodos de utilidad
    clearFilters,

    // Validaciones
    hasCustomDateError,
    isFilterActive,
  };
};
