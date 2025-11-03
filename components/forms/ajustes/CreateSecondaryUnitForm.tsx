"use client";
import {
  useCreateSecondaryUnit,
  useCreateUnit,
} from "@/actions/general/unidades/actions";
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
  secondary_unit: z.string().min(3, {
    message: "El nombre debe tener al menos 3 carácters.",
  }),
  convertion_rate: z.coerce.number().min(0),
  quantity_unit: z.coerce.number().min(0),
  unit_id: z.number(),
});

interface FormProps {
  onClose: () => void;
}

export default function CreateSecondaryUnitForm({ onClose }: FormProps) {
  const { selectedCompany } = useCompanyStore();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const { createSecondaryUnit } = useCreateSecondaryUnit();
  const { data: primaryUnits, isLoading: primaryLoading } = useGetUnits(
    selectedCompany?.slug
  );
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      convertion_rate: 1,
      quantity_unit: 0,
    },
  });
  const { control } = form;

  useEffect(() => {
    if (value) {
      form.setValue("unit_id", Number(value));
    }
  }, [form, value]);

  const selectedPrimaryUnit = primaryUnits?.find(
    (unit) => unit.id.toString() === value
  );

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Intercambiar los valores antes de enviar al backend
    // El usuario ingresa: quantity_unit = cantidad (ej: 50), convertion_rate = 1
    // Pero el backend espera: convertion_rate = cantidad (ej: 50), quantity_unit = 1
    const payload = {
      secondary_unit: values.secondary_unit,
      convertion_rate: values.quantity_unit, // El quantity_unit del formulario (50) va a convertion_rate
      quantity_unit: values.convertion_rate, // El convertion_rate del formulario (1) va a quantity_unit
      unit_id: values.unit_id,
    };
    console.log("Datos enviados al backend:", payload);
    await createSecondaryUnit.mutate(payload);
    // Resetear el formulario después de crear
    form.reset();
    setValue("");
    setOpen(false);
    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Nombre de la Unidad Secundaria */}
        <FormField
          control={control}
          name="secondary_unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Nombre de la Unidad Secundaria</FormLabel>
              <FormControl>
                <Input
                  placeholder="EJ: Caja de 24u, Paquete de 6u, Bolsa de 10u"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                El nombre descriptivo de su unidad secundaria (ej: &quot;Caja de 24 unidades&quot;)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Unidad Primaria - Movido antes de cantidad */}
        <FormField
          control={control}
          name="unit_id"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-base font-semibold">Unidad Primaria de Referencia</FormLabel>
              <FormControl>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      disabled={primaryLoading}
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                    >
                      {primaryUnits && value
                        ? primaryUnits.find(
                            (primaryUnits) =>
                              primaryUnits.id.toString() === value
                          )?.label || "Seleccione..."
                        : "Seleccione una unidad primaria..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar unidad primaria..." />
                      <CommandList>
                        <CommandEmpty>
                          No se encontraron unidades primarias.
                        </CommandEmpty>
                        <CommandGroup>
                          {primaryUnits &&
                            primaryUnits.map((primaryUnit) => (
                              <CommandItem
                                key={primaryUnit.id}
                                value={primaryUnit.id.toString()}
                                onSelect={(currentValue) => {
                                  setValue(
                                    currentValue === value ? "" : currentValue
                                  );
                                  setOpen(false);
                                }}
                              >
                                {primaryUnit.label}
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    value === primaryUnit.id.toString()
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </FormControl>
              <FormDescription>
                Seleccione la unidad primaria a la cual se relacionará esta unidad secundaria (ej: Unidad, Kilogramo, Litro)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Cantidad de unidades que contiene */}
        <FormField
          control={control}
          name="quantity_unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">
                Cantidad de Unidades que Contiene
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="EJ: 24, 6, 10, 36"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                ¿Cuántas unidades de la unidad primaria contiene esta unidad secundaria? 
                {selectedPrimaryUnit && (
                  <span className="block mt-1 text-sm text-muted-foreground italic">
                    Ejemplo: Si seleccionaste &quot;{selectedPrimaryUnit.label}&quot;, y esta unidad secundaria contiene 36 unidades, ingresa 36
                  </span>
                )}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Valor por unidad */}
        <FormField
          control={control}
          name="convertion_rate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Valor de Conversión por Unidad</FormLabel>
              <FormControl>
                <Input 
                  type="number"
                  min="0"
                  step="any"
                  placeholder="EJ: 1, 0.5, 2"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                El valor de conversión equivalente a una unidad primaria. 
                {selectedPrimaryUnit && (
                  <span className="block mt-1 text-sm text-muted-foreground italic">
                    Si 1 unidad secundaria = 1 {selectedPrimaryUnit.label}, ingresa 1. Si 1 unidad secundaria = 0.5 {selectedPrimaryUnit.label}, ingresa 0.5
                  </span>
                )}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Ejemplo de ayuda visual */}
        {selectedPrimaryUnit && form.watch("quantity_unit") && form.watch("convertion_rate") && (
          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-semibold text-foreground">Ejemplo de relación:</p>
            <p className="text-sm text-muted-foreground">
              1 <strong>{form.watch("secondary_unit") || "unidad secundaria"}</strong> = {" "}
              {form.watch("quantity_unit") || 0} {selectedPrimaryUnit.label}
              {form.watch("convertion_rate") && form.watch("convertion_rate") !== 1 && (
                <span className="block mt-1">
                  (Valor de conversión por unidad: {form.watch("convertion_rate")})
                </span>
              )}
            </p>
          </div>
        )}

        <Button
          className="w-full bg-primary mt-4 text-white hover:bg-blue-900 disabled:bg-primary/70"
          disabled={createSecondaryUnit?.isPending}
          type="submit"
        >
          {createSecondaryUnit?.isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Creando...
            </>
          ) : (
            "Crear Unidad Secundaria"
          )}
        </Button>
      </form>
    </Form>
  );
}
