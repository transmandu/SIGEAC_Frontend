"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CreateUnitForm from "@/components/forms/ajustes/CreateUnitForm";
import type { Unit } from "@/types";

interface UnitComboboxProps {
  /** Selected unit id as a string (matches the form field value). */
  value?: string;
  onChange: (value: string) => void;
  units?: Unit[];
  disabled?: boolean;
  invalid?: boolean | string;
  /** Extra classes for the trigger button (height, text size, etc.). */
  triggerClassName?: string;
  placeholder?: string;
}

export function UnitCombobox({
  value,
  onChange,
  units,
  disabled,
  invalid,
  triggerClassName,
  placeholder = "Seleccionar unidad",
}: UnitComboboxProps) {
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const selected = units?.find((u) => u.id.toString() === value);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full min-w-0 justify-between bg-background/70 font-normal",
              !selected && "text-muted-foreground",
              invalid && "border-destructive/60 ring-1 ring-destructive/30",
              triggerClassName
            )}
          >
            <span className="min-w-0 truncate">
              {selected ? selected.label : placeholder}
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
            <CommandInput placeholder="Buscar unidad..." className="h-9" />

            {/* Crear unidad — always the first, non-filtered action */}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setCreateOpen(true);
              }}
              className="flex w-full items-center gap-2 border-b px-3 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
            >
              <Plus className="size-4" />
              Crear unidad
            </button>

            <CommandList>
              <CommandEmpty>Sin resultados</CommandEmpty>
              <CommandGroup>
                {units?.map((unit) => (
                  <CommandItem
                    key={unit.id}
                    value={`${unit.label} ${unit.value}`}
                    onSelect={() => {
                      onChange(unit.id.toString());
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4 shrink-0",
                        unit.id.toString() === value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="min-w-0 truncate">{unit.label}</span>
                    {unit.value && (
                      <span className="ml-auto pl-2 text-xs text-muted-foreground shrink-0">
                        {unit.value}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Crear unidad modal — auto-selects the new unit on success */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[490px]">
          <DialogHeader>
            <DialogTitle>Creación de Unidad</DialogTitle>
            <DialogDescription>
              Registre una unidad de medida rellenando la información necesaria.
            </DialogDescription>
          </DialogHeader>
          <CreateUnitForm
            onClose={() => setCreateOpen(false)}
            onCreated={(unit) => onChange(unit.id.toString())}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
