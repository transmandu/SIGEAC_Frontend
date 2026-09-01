"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DataTableSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/** Misma base visual que ActionTriggerButton: alto, radio, borde y sombra. */
export function DataTableSearchInput({
  value,
  onChange,
  placeholder = "Buscar...",
  className,
}: DataTableSearchInputProps) {
  return (
    <div
      className={cn(
        "group relative flex h-10 items-center rounded-md border border-border bg-background shadow-sm transition-all duration-200",
        "hover:border-primary/40 hover:shadow-md",
        "focus-within:border-primary/40 focus-within:shadow-md focus-within:ring-2 focus-within:ring-primary/20",
        className,
      )}
    >
      <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-full w-full rounded-md bg-transparent pl-9 pr-9 text-sm font-medium outline-none placeholder:font-normal placeholder:text-muted-foreground"
      />
      {value.length > 0 && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onChange("")}
          className="absolute right-1 size-7 rounded-sm text-muted-foreground hover:text-foreground"
          aria-label="Limpiar búsqueda"
        >
          <X className="size-3.5" />
        </Button>
      )}
    </div>
  );
}
