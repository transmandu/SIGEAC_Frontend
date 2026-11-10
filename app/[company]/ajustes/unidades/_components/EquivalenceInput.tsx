"use client";

import { fieldClass } from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * "1 GALÓN = [ valor ] LITRO": la frase completa en una sola línea para que
 * quien captura vea qué está declarando antes de guardar.
 */
export function EquivalenceInput({
  from,
  to,
  value,
  onChange,
  placeholder,
  type,
}: {
  from: string;
  to: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  type: "text" | "number";
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm max-sm:text-base">
      <span className="font-medium whitespace-nowrap text-foreground">
        1 {from} =
      </span>
      <Input
        autoFocus
        type={type}
        inputMode="decimal"
        {...(type === "number" ? { min: "0", step: "any" } : {})}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(fieldClass, "w-36 tabular-nums max-sm:flex-1")}
      />
      <span className="font-medium whitespace-nowrap text-foreground">
        {to}
      </span>
    </div>
  );
}
