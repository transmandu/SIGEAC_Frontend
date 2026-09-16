"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
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
import type { Workshop } from "@/types";

interface WorkshopComboboxProps {
  /** Selected workshop id as a string (matches the form field value). */
  value?: string;
  onChange: (value: string) => void;
  workshops?: Workshop[];
  disabled?: boolean;
  invalid?: boolean | string;
  triggerClassName?: string;
  placeholder?: string;
}

/**
 * Solo el selector: crear un taller nuevo vive en un botón aparte junto al
 * label del campo (ver WorkshopDispatchForm), igual que "Crear" al lado de
 * la descripción del renglón en IdentificationSection — no duplicado aquí
 * dentro del popover.
 */
export function WorkshopCombobox({
  value,
  onChange,
  workshops,
  disabled,
  invalid,
  triggerClassName,
  placeholder = "Seleccione el taller...",
}: WorkshopComboboxProps) {
  const [open, setOpen] = useState(false);

  const selected = workshops?.find((w) => w.id.toString() === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "h-10 w-full min-w-0 justify-between font-normal",
            !selected && "text-muted-foreground",
            invalid && "border-destructive/60 ring-1 ring-destructive/30",
            triggerClassName,
          )}
        >
          <span className="min-w-0 truncate">
            {selected ? selected.name : placeholder}
          </span>
          <ChevronsUpDown className="ml-1 size-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[max(var(--radix-popover-trigger-width),220px)] p-0"
        align="start"
      >
        <Command
          filter={(itemValue, search) =>
            itemValue.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
          }
        >
          <CommandInput placeholder="Buscar taller..." className="h-9" />
          <CommandList>
            <CommandEmpty>No se encontró ningún taller.</CommandEmpty>
            <CommandGroup>
              {workshops?.map((workshop) => (
                <CommandItem
                  key={workshop.id}
                  value={workshop.name}
                  onSelect={() => {
                    onChange(workshop.id.toString());
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4 shrink-0",
                      workshop.id.toString() === value
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  <span className="min-w-0 truncate">{workshop.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
