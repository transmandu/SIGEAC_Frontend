"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { triggerButtonClass } from "@/components/forms/mantenimiento/almacen/_components/form-theme";

export interface UserOption {
  id: string;
  /** Nombre de usuario. */
  label: string;
  /** Línea secundaria: a quién pertenece. */
  detail?: string;
}

/**
 * Elige el usuario que se vincula a un empleado. Solo se ofrecen los que no
 * tienen empleado (más el actual, al editar): un usuario es de una sola persona.
 * Se puede quitar el vínculo con la equis.
 */
export function EmployeeUserPicker({
  value,
  onChange,
  options,
  loading,
  disabled,
  invalid,
}: {
  value: string;
  onChange: (value: string) => void;
  options: UserOption[];
  loading?: boolean;
  disabled?: boolean;
  invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.id === value);

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            aria-invalid={invalid}
            className={cn(
              triggerButtonClass,
              "min-w-0 flex-1 justify-between font-normal",
              !selected && "text-muted-foreground",
            )}
          >
            <span className="truncate">
              {selected
                ? `${selected.label}${selected.detail ? ` · ${selected.detail}` : ""}`
                : "Buscar usuario..."}
            </span>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="pointer-events-auto w-(--radix-popover-trigger-width) min-w-64 p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder="Buscar por usuario o nombre..." />
            <CommandList>
              <CommandEmpty>
                {loading ? (
                  <Loader2 className="mx-auto size-4 animate-spin" />
                ) : (
                  "No hay usuarios disponibles."
                )}
              </CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={`${option.label} ${option.detail ?? ""}`}
                    onSelect={() => {
                      onChange(option.id === value ? "" : option.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4",
                        option.id === value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm">
                        {option.label}
                      </span>
                      {option.detail && (
                        <span className="block truncate text-xs text-muted-foreground">
                          {option.detail}
                        </span>
                      )}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selected && !disabled && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onChange("")}
          aria-label="Quitar el usuario vinculado"
          className="size-9 shrink-0 text-muted-foreground max-sm:size-10"
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}
