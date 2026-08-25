"use client";

import { Check, ChevronsUpDown, Hash, Loader2, Plus } from "lucide-react";
import type { Control, UseFormReturn } from "react-hook-form";

import { CreateManufacturerDialog } from "@/components/dialogs/general/CreateManufacturerDialog";
import { CreateBatchDialog } from "@/components/dialogs/mantenimiento/almacen/CreateBatchDialog";
import { MultiInputField } from "@/components/misc/MultiInputField";
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
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Batch, Manufacturer } from "@/types";

import {
    FormSection,
    fieldClass,
    hintClass,
    labelClass,
    triggerButtonClass,
} from "../../_components/form-theme";

/** Combobox con buscador; los tres selectores de la sección comparten forma. */
export const SearchableSelect = <T extends { id: number | string; name: string }>({
    options,
    value,
    onSelect,
    placeholder,
    searchPlaceholder,
    emptyLabel,
    loading,
    disabled,
    renderLabel,
}: {
    options?: T[];
    value?: string;
    onSelect: (option: T) => void;
    placeholder: string;
    searchPlaceholder: string;
    emptyLabel: string;
    loading?: boolean;
    disabled?: boolean;
    renderLabel?: (option: T) => React.ReactNode;
}) => {
    const selected = options?.find((option) => `${option.id}` === value);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <FormControl>
                    <Button
                        type="button"
                        disabled={disabled}
                        variant="outline"
                        role="combobox"
                        className={cn(triggerButtonClass, !value && "text-muted-foreground")}
                    >
                        {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                        <span className="truncate">
                            {selected ? selected.name : placeholder}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
                <Command>
                    <CommandInput placeholder={searchPlaceholder} />
                    <CommandList>
                        <CommandEmpty className="p-2 text-center text-xs">
                            {emptyLabel}
                        </CommandEmpty>
                        <CommandGroup>
                            {options?.map((option) => (
                                <CommandItem
                                    key={option.id}
                                    value={option.name}
                                    onSelect={() => onSelect(option)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            `${option.id}` === value ? "opacity-100" : "opacity-0",
                                        )}
                                    />
                                    {renderLabel ? renderLabel(option) : <p>{option.name}</p>}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

const upper = (value?: string) => value?.trim().toUpperCase() ?? "";

/**
 * Identificación del artículo: los campos que toda categoría comparte.
 *
 * Cada formulario añade después lo suyo (calibración, life limit, cantidades).
 */
export const IdentificationSection = ({
    form,
    batches,
    batchesLoading,
    manufacturers,
    manufacturersLoading,
    batchLabel,
    batchCategory,
    onBatchCreated,
    purchaseOrderLocked,
    disabled,
    /** Campos propios de la categoría, dentro del mismo grid. */
    children,
}: {
    form: UseFormReturn<any>;
    batches?: Batch[];
    batchesLoading?: boolean;
    manufacturers?: Manufacturer[];
    manufacturersLoading?: boolean;
    batchLabel: string;
    batchCategory: string;
    onBatchCreated?: (batchName: string) => void | Promise<void>;
    purchaseOrderLocked?: boolean;
    disabled?: boolean;
    children?: React.ReactNode;
}) => {
    const control: Control<any> = form.control;

    return (
        <FormSection
            icon={Hash}
            title="Identificación"
            hint="Con qué datos se reconoce el artículo en el inventario."
        >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <FormField
                    control={control}
                    name="part_number"
                    render={({ field }) => (
                        <FormItem className="w-full">
                            <FormLabel className={labelClass}>Nro. de parte</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Ej: 234ABAC"
                                    {...field}
                                    value={field.value ?? ""}
                                    disabled={disabled}
                                    className={fieldClass}
                                    onBlur={(e) => field.onChange(upper(e.target.value))}
                                />
                            </FormControl>
                            <FormDescription className={hintClass}>
                                Identificador principal del artículo.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="purchase_order_number"
                    render={({ field }) => (
                        <FormItem className="w-full">
                            <FormLabel className={labelClass}>Nro. de orden de compra</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Ej: OC-2026-014"
                                    {...field}
                                    value={field.value ?? ""}
                                    readOnly={purchaseOrderLocked}
                                    disabled={disabled}
                                    className={fieldClass}
                                />
                            </FormControl>
                            <FormDescription className={hintClass}>
                                {purchaseOrderLocked
                                    ? "Proviene de una orden del sistema: no puede modificarse."
                                    : "Número del formato que lleva compras, si el artículo no nace de un ciclo de compra."}
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="batch_id"
                    render={({ field }) => (
                        <FormItem className="w-full">
                            <div className="flex min-h-6 items-center justify-between gap-2">
                                <FormLabel className={labelClass}>{batchLabel}</FormLabel>
                                {onBatchCreated && (
                                    <CreateBatchDialog
                                        defaultCategory={batchCategory}
                                        onSuccess={onBatchCreated}
                                        triggerButton={
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 px-1.5 text-xs"
                                            >
                                                <Plus className="mr-1 h-3 w-3" />
                                                Crear
                                            </Button>
                                        }
                                    />
                                )}
                            </div>
                            <SearchableSelect
                                options={batches}
                                value={field.value}
                                loading={batchesLoading}
                                disabled={disabled || batchesLoading}
                                placeholder="Elegir descripción..."
                                searchPlaceholder="Buscar descripción..."
                                emptyLabel="No se encontró ninguna descripción."
                                onSelect={(batch) =>
                                    form.setValue("batch_id", batch.id.toString(), {
                                        shouldValidate: true,
                                        shouldDirty: true,
                                    })
                                }
                            />
                            <FormDescription className={hintClass}>
                                Descripción del artículo a registrar.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="manufacturer_id"
                    render={({ field }) => (
                        <FormItem className="w-full">
                            <div className="flex min-h-6 items-center justify-between gap-2">
                                <FormLabel className={labelClass}>Fabricante</FormLabel>
                                <CreateManufacturerDialog
                                    defaultType="PART"
                                    onSuccess={(manufacturer) => {
                                        if (manufacturer?.id) {
                                            form.setValue(
                                                "manufacturer_id",
                                                manufacturer.id.toString(),
                                                { shouldValidate: true, shouldDirty: true },
                                            );
                                        }
                                    }}
                                    triggerButton={
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 px-1.5 text-xs"
                                        >
                                            <Plus className="mr-1 h-3 w-3" />
                                            Crear
                                        </Button>
                                    }
                                />
                            </div>
                            <SearchableSelect
                                options={manufacturers}
                                value={field.value}
                                loading={manufacturersLoading}
                                disabled={disabled || manufacturersLoading}
                                placeholder="Seleccione fabricante..."
                                searchPlaceholder="Buscar fabricante..."
                                emptyLabel="No se encontró el fabricante."
                                onSelect={(manufacturer) =>
                                    form.setValue("manufacturer_id", manufacturer.id.toString(), {
                                        shouldValidate: true,
                                        shouldDirty: true,
                                    })
                                }
                            />
                            <FormDescription className={hintClass}>
                                Marca del artículo.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="zone"
                    render={({ field }) => (
                        <FormItem className="w-full">
                            <FormLabel className={labelClass}>Ubicación interna</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Ej: Pasillo 4, Estante B"
                                    {...field}
                                    value={field.value ?? ""}
                                    disabled={disabled}
                                    className={fieldClass}
                                />
                            </FormControl>
                            <FormDescription className={hintClass}>
                                Zona física en almacén.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {children}

                <FormField
                    control={control}
                    name="alternative_part_number"
                    render={({ field }) => (
                        <FormItem className="w-full md:col-span-2 xl:col-span-3">
                            <FormLabel className={labelClass}>Nros. de parte alternos</FormLabel>
                            <FormControl>
                                <MultiInputField
                                    values={field.value || []}
                                    onChange={(values: string[]) =>
                                        field.onChange(values.map(upper))
                                    }
                                    placeholder="Ej: 234ABAC"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </FormSection>
    );
};
