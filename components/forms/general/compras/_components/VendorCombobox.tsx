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
import CreateVendorForm from "@/components/forms/general/CreateVendorForm";
import { useCreateVendor } from "@/actions/ajustes/globales/proveedores/actions";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { Vendor } from "@/types";

interface VendorComboboxProps {
  /** Selected vendor id as a string (matches the form field value). */
  value?: string;
  onChange: (value: string) => void;
  vendors?: Vendor[];
  disabled?: boolean;
  invalid?: boolean | string;
  /** Extra classes for the trigger button (height, text size, etc.). */
  triggerClassName?: string;
  placeholder?: string;
}

export function VendorCombobox({
  value,
  onChange,
  vendors,
  disabled,
  invalid,
  triggerClassName,
  placeholder = "Seleccionar proveedor",
}: VendorComboboxProps) {
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const { selectedCompany } = useCompanyStore();
  const createVendor = useCreateVendor(selectedCompany?.slug);

  const selected = vendors?.find((v) => v.id.toString() === value);

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
            <CommandInput placeholder="Buscar proveedor..." className="h-9" />

            {/* Crear proveedor — always the first, non-filtered action */}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setCreateOpen(true);
              }}
              className="flex w-full items-center gap-2 border-b px-3 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
            >
              <Plus className="size-4" />
              Crear proveedor
            </button>

            <CommandList>
              <CommandEmpty>Sin resultados</CommandEmpty>
              <CommandGroup>
                {vendors?.map((vendor) => (
                  <CommandItem
                    key={vendor.id}
                    value={vendor.name}
                    onSelect={() => {
                      onChange(vendor.id.toString());
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4 shrink-0",
                        vendor.id.toString() === value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="min-w-0 truncate">{vendor.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Crear proveedor modal — auto-selects the new vendor on success */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Creación de Proveedor</DialogTitle>
            <DialogDescription>
              Registre un proveedor o beneficiario rellenando la información necesaria.
            </DialogDescription>
          </DialogHeader>
          <CreateVendorForm
            onClose={() => setCreateOpen(false)}
            onSubmit={async (data) => {
              const created = await createVendor.mutateAsync(data);
              onChange(created.id.toString());
            }}
            isLoading={createVendor.isPending}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
