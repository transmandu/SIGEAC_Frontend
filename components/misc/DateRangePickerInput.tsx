"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { parseISO, isValid } from "date-fns";
import { RotateCcw, Search } from "lucide-react";

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
  const [fromDate, setFromDate] = useState<string>(initialDate?.from || "");
  const [toDate, setToDate] = useState<string>(initialDate?.to || "");

  useEffect(() => {
    if (initialDate) {
      setFromDate(initialDate.from);
      setToDate(initialDate.to);
    }
  }, [initialDate]);

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFromDate(value);
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setToDate(value);
  };

  const handleSearchClick = () => {
    // Only trigger if both dates are present (HTML5 date inputs return empty string if incomplete/invalid)
    if (!fromDate || !toDate) return;

    // parseISO handles YYYY-MM-DD nicely
    const fromD = parseISO(fromDate);
    const toD = parseISO(toDate);

    if (isValid(fromD) && isValid(toD)) {
        onDateChange({ from: fromD, to: toD });
    }
  };

  const handleResetClick = () => {
    if (onReset) onReset();
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-end">
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="from-date" className="text-xs text-muted-foreground">Desde</Label>
        <Input
          type="date"
          id="from-date"
          value={fromDate}
          onChange={handleFromChange}
          className="w-full"
        />
      </div>
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="to-date" className="text-xs text-muted-foreground">Hasta</Label>
        <Input
          type="date"
          id="to-date"
          value={toDate}
          onChange={handleToChange}
          className="w-full"
        />
      </div>
      <div className="flex gap-2">
        <Button
          size="icon"
          onClick={handleSearchClick}
          disabled={!fromDate || !toDate}
          title="Buscar"
          className="shrink-0"
        >
          <Search className="h-4 w-4" />
        </Button>

        {onReset && (
          <Button
            variant="outline"
            size="icon"
            onClick={handleResetClick}
            title="Reiniciar fechas"
            className="shrink-0"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default DateRangePickerInput;
