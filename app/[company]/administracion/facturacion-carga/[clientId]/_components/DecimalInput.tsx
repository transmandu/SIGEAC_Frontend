"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function DecimalInput({
  value,
  onValueChange,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "type"> & {
  value: string;
  onValueChange: (value: string) => void;
}) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;

    if (raw === "") {
      onValueChange("");
      return;
    }

    const normalized = raw.replace(/,/g, ".");

    if (!/^\d*\.?\d*$/.test(normalized)) return;

    onValueChange(normalized);
  };

  return (
    <Input
      {...props}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={value}
      onChange={handleChange}
      className={cn("tabular-nums", className)}
    />
  );
}
