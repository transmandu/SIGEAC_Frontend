import { useMemo } from "react";
import { format } from "date-fns";

/** El día local del Date, sin pasar por UTC (que lo correría un día). */
const toCalendarDay = (date: Date) => format(date, "yyyy-MM-dd");

type PeriodType = "current_month" | "month" | "year" | "custom";

interface UseDateRangeCalculatorProps {
  periodType: PeriodType;
  selectedMonth: string;
  selectedYear: string;
  customFrom: string;
  customTo: string;
}

export const useDateRangeCalculator = ({
  periodType,
  selectedMonth,
  selectedYear,
  customFrom,
  customTo,
}: UseDateRangeCalculatorProps) => {
  const dateRange = useMemo(() => {
    const now = new Date();

    switch (periodType) {
      case "current_month": {
        const first = new Date(now.getFullYear(), now.getMonth(), 1);
        const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return {
          first_date: toCalendarDay(first),
          second_date: toCalendarDay(last),
        };
      }

      case "month": {
        const [year, month] = selectedMonth.split("-");
        const first = new Date(Number(year), Number(month) - 1, 1);
        const last = new Date(Number(year), Number(month), 0);
        return {
          first_date: toCalendarDay(first),
          second_date: toCalendarDay(last),
        };
      }

      case "year": {
        const first = new Date(Number(selectedYear), 0, 1);
        const last = new Date(Number(selectedYear), 11, 31);
        return {
          first_date: toCalendarDay(first),
          second_date: toCalendarDay(last),
        };
      }

      case "custom": {
        if (!customFrom || !customTo) return undefined;
        return {
          first_date: customFrom,
          second_date: customTo,
        };
      }

      default:
        return undefined;
    }
  }, [periodType, selectedMonth, selectedYear, customFrom, customTo]);

  return dateRange;
};
