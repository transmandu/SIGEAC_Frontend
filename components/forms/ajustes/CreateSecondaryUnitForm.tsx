"use client";
import { useCreateSecondaryUnit } from "@/actions/general/unidades/actions";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../../ui/button";
import { useGetUnits } from "@/hooks/general/unidades/useGetPrimaryUnits";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";

const formSchema = z.object({
  equivalence: z.coerce
    .number({ invalid_type_error: "Debe ser un número válido." }),
  primary_unit: z.number().min(1, "Debe seleccionar la unidad primaria."),
  secondary_unit: z
    .number()
    .min(1, "Debe seleccionar la unidad secundaria.")
    .optional(),
});

interface FormProps {
  onClose: () => void;
}

export default function CreateSecondaryUnitForm({ onClose }: FormProps) {
  const { selectedCompany } = useCompanyStore();
  const [primaryOpen, setPrimaryOpen] = useState(false);
  const [secondaryOpen, setSecondaryOpen] = useState(false);
  const [primaryValue, setPrimaryValue] = useState("");
  const [secondaryValue, setSecondaryValue] = useState("");
  const { createSecondaryUnit } = useCreateSecondaryUnit();
  const { data: primaryUnits, isLoading: primaryLoading } = useGetUnits(
    selectedCompany?.slug
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      equivalence: 1,
      primary_unit: undefined,
      secondary_unit: undefined,
    },
  });
  const { control } = form;

  useEffect(() => {
    if (primaryValue) {
      form.setValue("primary_unit", Number(primaryValue), {
        shouldValidate: true,
      });
    }
  }, [form, primaryValue]);

  useEffect(() => {
    if (secondaryValue) {
      form.setValue("secondary_unit", Number(secondaryValue), {
        shouldValidate: true,
      });
    }
  }, [form, secondaryValue]);

  const selectedPrimaryUnit = primaryUnits?.find(
    (unit) => unit.id.toString() === primaryValue
  );

  const selectedSecondaryUnit = primaryUnits?.find(
    (unit) => unit.id.toString() === secondaryValue
  );

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Intercambiar los valores antes de enviar al backend
    const payload = {
      primary_unit: values.primary_unit,
      secondary_unit: values.secondary_unit,
      equivalence: values.equivalence,
    };
    await createSecondaryUnit.mutate(payload);
    form.reset();
    setPrimaryValue("");
    setSecondaryValue("");
    setPrimaryOpen(false);
    setSecondaryOpen(false);
    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          {/* Unidad Primaria de Referencia (Dropdown) */}
          <FormField
            control={control}
            name="primary_unit"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-sm font-medium">
                  Unidad Primaria de Referencia
                </FormLabel>
                <FormControl>
                  <Popover open={primaryOpen} onOpenChange={setPrimaryOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        disabled={primaryLoading}
                        variant="outline"
                        role="combobox"
                        aria-expanded={primaryOpen}
                        className="w-full justify-between"
                      >
                        {primaryUnits && primaryValue
                          ? primaryUnits.find(
                              (primaryUnit) =>
                                primaryUnit.id.toString() === primaryValue
                            )?.label || "Seleccione..."
                          : primaryLoading
                            ? "Cargando unidades..."
                            : "Seleccione una unidad primaria..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[var(--radix-popover-trigger-width)] p-0"
                      align="start"
                    >
                      <Command>
                        <CommandInput placeholder="Buscar unidad primaria..." />
                        <CommandList>
                          <CommandEmpty>
                            No se encontraron unidades primarias.
                          </CommandEmpty>
                          <CommandGroup>
                            {primaryUnits && primaryUnits.length > 0 ? (
                              primaryUnits.map((primaryUnit) => (
                                <CommandItem
                                  key={primaryUnit.id}
                                  value={primaryUnit.id.toString()}
                                  onSelect={(currentValue) => {
                                    setPrimaryValue(
                                      currentValue === primaryValue
                                        ? ""
                                        : currentValue
                                    );
                                    setPrimaryOpen(false);
                                  }}
                                >
                                  {primaryUnit.label}
                                  <Check
                                    className={cn(
                                      "ml-auto h-4 w-4",
                                      primaryValue === primaryUnit.id.toString()
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))
                            ) : (
                              <CommandItem disabled>
                                No hay unidades primarias disponibles
                              </CommandItem>
                            )}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormDescription></FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Cantidad de unidades que contiene (EQUIVALENCE 1) */}
          <FormField
            control={control}
            name="equivalence"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Valor de conversión por unidad
                </FormLabel>
                <FormControl>
                  {/* ✅ CORRECCIÓN 3: CAMBIAMOS 'type="number"' a 'type="text"' */}
                  <Input
                    type="number"
                    inputMode="decimal" // Sugerencia para teclados móviles
                    placeholder=""
                    // Manejo de cambio: limpiamos la coma y pasamos el string. Zod hace la conversión en submit.
                    onChange={(e) => {
                      const value = e.target.value;
                      // Aseguramos que el punto sea el separador decimal para Zod
                      const cleanedValue = value.replace(/,/g, ".");
                      field.onChange(cleanedValue);
                    }}
                    // Aseguramos que el valor se muestre como string
                    value={
                      field.value === undefined || field.value === null
                        ? ""
                        : field.value.toString()
                    }
                  />
                </FormControl>
                <FormDescription>
                  {selectedPrimaryUnit && selectedSecondaryUnit && (
                    <span className="block mt-1 text-sm text-muted-foreground italic">
                      Ejemplo: 1 {selectedSecondaryUnit.label} ={" "}
                      {field.value || 0} {selectedPrimaryUnit.label}
                    </span>
                  )}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Unidad Secundaria (Dropdown) */}
          <FormField
            control={control}
            name="secondary_unit"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-sm font-medium">
                  Unidad Secundaria
                </FormLabel>
                <FormControl>
                  <Popover open={secondaryOpen} onOpenChange={setSecondaryOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        disabled={primaryLoading}
                        variant="outline"
                        role="combobox"
                        aria-expanded={secondaryOpen}
                        className="w-full justify-between"
                      >
                        {primaryUnits && secondaryValue
                          ? primaryUnits.find(
                              (primaryUnit) =>
                                primaryUnit.id.toString() === secondaryValue
                            )?.label || "Seleccione..."
                          : primaryLoading
                            ? "Cargando unidades..."
                            : "Seleccione una unidad secundaria..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[var(--radix-popover-trigger-width)] p-0"
                      align="start"
                    >
                      <Command>
                        <CommandInput placeholder="Buscar unidad secundaria..." />
                        <CommandList>
                          <CommandEmpty>
                            No se encontraron unidades.
                          </CommandEmpty>
                          <CommandGroup>
                            {primaryUnits && primaryUnits.length > 0 ? (
                              primaryUnits.map((primaryUnit) => (
                                <CommandItem
                                  key={primaryUnit.id}
                                  value={primaryUnit.id.toString()}
                                  onSelect={(currentValue) => {
                                    setSecondaryValue(
                                      currentValue === secondaryValue
                                        ? ""
                                        : currentValue
                                    );
                                    setSecondaryOpen(false);
                                  }}
                                >
                                  {primaryUnit.label}
                                  <Check
                                    className={cn(
                                      "ml-auto h-4 w-4",
                                      secondaryValue ===
                                        primaryUnit.id.toString()
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))
                            ) : (
                              <CommandItem disabled>
                                No hay unidades disponibles
                              </CommandItem>
                            )}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormDescription></FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Botón de envío */}
          <Button
            className="w-full bg-primary mt-4 text-white hover:bg-blue-900 disabled:bg-primary/70"
            disabled={createSecondaryUnit?.isPending || !primaryValue}
            type="submit"
          >
            {createSecondaryUnit?.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Creando...
              </>
            ) : (
              "Crear Relación de Unidades"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
