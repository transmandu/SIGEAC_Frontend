"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Plus, Truck } from "lucide-react";
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
import { CreateShippingAgencyForm } from "@/components/forms/general/CreateShippingAgencyForm";
import { useCanManageCatalog } from "@/hooks/helpers/useCanManageCatalog";
import type { ShippingAgency } from "@/types";

interface ShippingAgencyComboboxProps {
  /** Id de la agencia elegida, como texto (igual que el campo del formulario). */
  value?: string;
  onChange: (value: string) => void;
  agencies?: ShippingAgency[];
  loading?: boolean;
  disabled?: boolean;
  /** Clases del botón (altura, tamaño de texto…). */
  triggerClassName?: string;
  placeholder?: string;
}

/**
 * Agencia de envío con búsqueda. Crear una agencia nueva sin salir del
 * formulario solo se ofrece a quien administra ese catálogo.
 */
export function ShippingAgencyCombobox({
  value,
  onChange,
  agencies,
  loading,
  disabled,
  triggerClassName,
  placeholder = "Seleccionar agencia...",
}: ShippingAgencyComboboxProps) {
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const canCreate = useCanManageCatalog("shippingAgencies");

  const selected = agencies?.find((agency) => agency.id.toString() === value);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled || loading}
            className={cn(
              triggerButtonClass,
              "h-10 min-w-0 max-sm:text-base",
              !selected && "text-muted-foreground",
              triggerClassName,
            )}
          >
            <span className="min-w-0 truncate">
              {loading
                ? "Cargando..."
                : selected
                  ? `${selected.name} (${selected.code})`
                  : placeholder}
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
              placeholder="Buscar agencia..."
              className="h-10 max-sm:text-base"
            />

            {canCreate && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setCreateOpen(true);
                }}
                className="flex w-full items-center gap-2 border-b px-3 py-2 text-sm font-medium max-sm:py-3 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
              >
                <Plus className="size-4" />
                Crear agencia
              </button>
            )}

            <CommandList>
              <CommandEmpty>Sin resultados</CommandEmpty>
              <CommandGroup>
                {agencies?.map((agency) => (
                  <CommandItem
                    className="max-sm:py-3"
                    key={agency.id}
                    value={`${agency.name} ${agency.code}`}
                    onSelect={() => {
                      onChange(agency.id.toString());
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4 shrink-0",
                        agency.id.toString() === value
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    <span className="min-w-0 truncate">
                      {agency.name} ({agency.code})
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {canCreate && (
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <FormDialogContent
            className="sm:max-w-2xl"
            icon={Truck}
            title="Nueva agencia de envío"
            description="Registre una agencia de envío para la gestión de distribución y logística."
          >
            <CreateShippingAgencyForm
              onClose={() => setCreateOpen(false)}
              onCreated={(agency) => onChange(agency.id.toString())}
            />
          </FormDialogContent>
        </Dialog>
      )}
    </>
  );
}
