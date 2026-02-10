import { useMemo } from "react";

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
          first_date: first.toISOString().slice(0, 10),
          second_date: last.toISOString().slice(0, 10),
        };
      }

      case "month": {
        const [year, month] = selectedMonth.split("-");
        const first = new Date(Number(year), Number(month) - 1, 1);
        const last = new Date(Number(year), Number(month), 0);
        return {
          first_date: first.toISOString().slice(0, 10),
          second_date: last.toISOString().slice(0, 10),
        };
      }

      case "year": {
        const first = new Date(Number(selectedYear), 0, 1);
        const last = new Date(Number(selectedYear), 11, 31);
        return {
          first_date: first.toISOString().slice(0, 10),
          second_date: last.toISOString().slice(0, 10),
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
