"use client"

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetManufacturers } from "@/hooks/general/fabricantes/useGetManufacturers";
import { Manufacturer } from "@/types";
import { CreateManufacturerDialog } from "@/components/dialogs/general/CreateManufacturerDialog";

export default function IdentificationFields({ form, path }: any) {
    const { selectedCompany } = useCompanyStore();
    const { data: manufacturers, isLoading: isManufacturersLoading } = useGetManufacturers(selectedCompany?.slug);
    const [manufacturerOpen, setManufacturerOpen] = useState(false);

    const manufacturerOptions = useMemo(() => manufacturers || [], [manufacturers]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name={`${path}.serial`} render={({ field }: any) => (
                <FormItem>
                    <FormLabel>Serial</FormLabel>
                    <FormControl>
                        <Input placeholder="Serial (opcional)" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )} />

            <FormField control={form.control} name={`${path}.manufacturer_id`} render={({ field }: any) => (
                <FormItem className="flex flex-col">
                    <div className="flex items-center justify-between gap-2">
                        <FormLabel>Fabricante</FormLabel>
                        <CreateManufacturerDialog
                            onSuccess={(manufacturer: Manufacturer) => {
                                field.onChange(String(manufacturer.id));
                                setManufacturerOpen(false);
                            }}
                            triggerButton={
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 border-dashed"
                                    aria-label="Crear fabricante"
                                    onClick={() => setManufacturerOpen(false)}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            }
                        />
                    </div>
                    <Popover open={manufacturerOpen} onOpenChange={setManufacturerOpen}>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                    type="button"
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                        "w-full justify-between",
                                        !field.value && "text-muted-foreground",
                                    )}
                                >
                                    {isManufacturersLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <span className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left">
                                        <span className="truncate">
                                            {manufacturerOptions.find((manufacturer) => String(manufacturer.id) === field.value)?.name ||
                                                "Selecciona fabricante"}
                                        </span>
                                        {manufacturerOptions.find((manufacturer) => String(manufacturer.id) === field.value) && (
                                            <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                                                {manufacturerOptions.find((manufacturer) => String(manufacturer.id) === field.value)?.type}
                                            </span>
                                        )}
                                    </span>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[320px] p-0" align="start">
                            <Command>
                                <CommandInput placeholder="Buscar fabricante..." />
                                <CommandList>
                                    <CommandEmpty>No se encontraron fabricantes.</CommandEmpty>
                                    <CommandGroup>
                                        {manufacturerOptions.map((manufacturer) => (
                                            <CommandItem
                                                key={manufacturer.id}
                                                value={`${manufacturer.name} ${manufacturer.type}`}
                                                onSelect={() => {
                                                    field.onChange(String(manufacturer.id));
                                                    setManufacturerOpen(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        String(manufacturer.id) === field.value ? "opacity-100" : "opacity-0",
                                                    )}
                                                />
                                                <span className="flex w-full items-center justify-between gap-3">
                                                    <span className="truncate">{manufacturer.name}</span>
                                                    <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                                                        {manufacturer.type}
                                                    </span>
                                                </span>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                </FormItem>
            )} />
        </div>
    );
}
