"use client";
import { useCreateSecondaryUnit } from "@/actions/ajustes/globales/unidades/actions";
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

/**
 * Una conversión se guarda y se lee en un solo sentido en todo el sistema:
 * `1 <primaria> = equivalence <secundaria>`. El reporte de costos y la
 * conversión de costo a unidad base dependen de esa dirección, así que el
 * formulario la muestra explícita para no capturarla al revés.
 */

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

  const equivalenceValue = Number(form.watch("equivalence"));

  // Con la misma unidad de ambos lados la conversión es inservible: el reporte
  // identifica la unidad despachada como "la que no es la base" y no podría
  // distinguirlas.
  const sameUnit =
    !!primaryValue && !!secondaryValue && primaryValue === secondaryValue;

  const isValid =
    !!primaryValue &&
    !!secondaryValue &&
    !sameUnit &&
    Number.isFinite(equivalenceValue) &&
    equivalenceValue > 0;

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
                  Unidad Primaria — la unidad grande, de la que sale 1
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
                  Equivalencia — cuántas unidades secundarias salen de 1
                  primaria
                </FormLabel>
                <FormControl>
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
                  Ej.: si de 1 ROLLO se cortan 45 piezas, la primaria es ROLLO,
                  la secundaria PIEZA y aquí va 45.
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
                  Unidad Secundaria — la unidad pequeña que resulta
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

          {sameUnit && (
            <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/[0.06] px-3 py-2.5">
              <span className="text-sm text-destructive">
                La unidad primaria y la secundaria deben ser distintas. Si
                necesita subdividir una unidad, cree antes la unidad pequeña
                (ej. PIEZA 20X20) en el catálogo de unidades.
              </span>
            </div>
          )}

          {/* Cómo queda guardada la conversión, en la misma dirección en que
              la leen el despacho y el reporte de costos. */}
          {selectedPrimaryUnit && selectedSecondaryUnit && !sameUnit && (
            <div className="mt-4 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5">
              <span className="block text-[11px] uppercase tracking-wide text-muted-foreground/70">
                Se guardará como
              </span>
              <span className="block mt-1 text-sm font-medium tabular-nums">
                1 {selectedPrimaryUnit.label} = {equivalenceValue || 0}{" "}
                {selectedSecondaryUnit.label}
              </span>
              {equivalenceValue > 0 && (
                <span className="block mt-1.5 text-xs text-muted-foreground">
                  Al despachar 1 {selectedSecondaryUnit.label} se descuentan{" "}
                  {Number((1 / equivalenceValue).toFixed(4))}{" "}
                  {selectedPrimaryUnit.label}, y su costo es el de 1{" "}
                  {selectedPrimaryUnit.label} dividido entre {equivalenceValue}.
                </span>
              )}
            </div>
          )}

          {/* Botón de envío */}
          <Button
            className="w-full bg-primary mt-4 text-white hover:bg-blue-900 disabled:bg-primary/70"
            disabled={createSecondaryUnit?.isPending || !isValid}
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
