"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Plus, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { triggerButtonClass } from "@/components/forms/mantenimiento/almacen/_components/form-theme";
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
import { Dialog } from "@/components/ui/dialog";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import CreateRetailerForm from "@/components/forms/general/CreateRetailerForm";
import type { Retailer } from "@/types";
import { useCanManageCatalog } from "@/hooks/helpers/useCanManageCatalog";

interface RetailerComboboxProps {
  /** Selected retailer id as a string (matches the form field value). */
  value?: string;
  onChange: (value: string) => void;
  retailers?: Retailer[];
  disabled?: boolean;
  invalid?: boolean | string;
  /** Extra classes for the trigger button (height, text size, etc.). */
  triggerClassName?: string;
  placeholder?: string;
  /**
   * When true, long names in the open dropdown list wrap to multiple lines
   * instead of being truncated. The selected value in the trigger always
   * truncates regardless of this flag.
   */
  wrapOptions?: boolean;
}

export function RetailerCombobox({
  value,
  onChange,
  retailers,
  disabled,
  invalid,
  triggerClassName,
  placeholder = "Seleccionar comercio",
  wrapOptions = false,
}: RetailerComboboxProps) {
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const canCreate = useCanManageCatalog("retailers");

  const selected = retailers?.find((r) => r.id.toString() === value);

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
              triggerButtonClass,
              "h-10 min-w-0 max-sm:text-base",
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
            <CommandInput
              placeholder="Buscar comercio..."
              className="h-10 max-sm:text-base"
            />

            {canCreate && (
              <>
                {/* Crear comercio — always the first, non-filtered action */}
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setCreateOpen(true);
                  }}
                  className="flex w-full items-center gap-2 border-b px-3 py-2 text-sm font-medium max-sm:py-3 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                >
                  <Plus className="size-4" />
                  Crear comercio
                </button>
              </>
            )}

            <CommandList>
              <CommandEmpty>Sin resultados</CommandEmpty>
              <CommandGroup>
                {retailers?.map((retailer) => (
                  <CommandItem
                    key={retailer.id}
                    value={retailer.name}
                    onSelect={() => {
                      onChange(retailer.id.toString());
                      setOpen(false);
                    }}
                    className={cn("max-sm:py-3", wrapOptions && "items-start")}
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4 shrink-0",
                        wrapOptions && "mt-0.5",
                        retailer.id.toString() === value
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    <span
                      className={cn(
                        "min-w-0",
                        wrapOptions
                          ? "whitespace-normal wrap-break-word"
                          : "truncate",
                      )}
                    >
                      {retailer.name}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {canCreate && (
        <>
          {/* Crear comercio modal — auto-selects the new retailer on success */}
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <FormDialogContent
              className="sm:max-w-lg"
              icon={Store}
              title="Creación de Comercio"
              description="Registre un comercio o lugar de compra (tienda física o en línea) rellenando la información necesaria."
            >
              <CreateRetailerForm
                onClose={() => setCreateOpen(false)}
                onCreated={(retailer) => onChange(retailer.id.toString())}
              />
            </FormDialogContent>
          </Dialog>
        </>
      )}
    </>
  );
}
