"use client";

import { useUpdateFuelVehicle } from "@/actions/mantenimiento/almacen/combustible/actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { applyFuelValidationErrors, FUEL_PLATE_REGEX, FUEL_TYPES, FUEL_VEHICLE_TYPES, formatLiters } from "@/lib/fuel";
import { FuelType, FuelVehicle, FuelVehicleType } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  plate: z
    .string()
    .max(20, "Maximo 20 caracteres")
    .optional()
    .transform((value) => (value ? value.toUpperCase().replace(/[\s-]/g, "") : value))
    .refine((value) => !value || FUEL_PLATE_REGEX.test(value), {
      message: "Formato de placa invalido (ej: AB123CD, AB123C, ABC123 o A71BR6D)",
    }),
  brand: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  color: z.string().max(50).optional(),
  type: z.enum(["car", "truck", "motorcycle", "crane", "mule", "other"], {
    required_error: "Debe seleccionar un tipo",
  }),
  type_other: z.string().max(100).optional(),
  fuel_type: z.enum(["GASOLINE", "DIESEL"], {
    required_error: "Debe seleccionar el tipo de combustible",
  }),
  responsible: z.string().optional(),
  tank_capacity_liters: z.coerce
    .number()
    .positive("La capacidad debe ser mayor a 0"),
  km_per_liter: z.coerce.number().min(0, "Debe ser mayor o igual a 0").optional(),
  initial_km: z.coerce.number().min(0, "Debe ser mayor o igual a 0").optional(),
}).refine(
  (data) => data.type !== "other" || !!data.type_other?.trim(),
  {
    message: "Debe especificar el tipo de vehiculo",
    path: ["type_other"],
  },
);

type FormValues = z.infer<typeof formSchema>;

export function EditFuelVehicleForm({
  company,
  vehicle,
  onClose,
}: {
  company?: string;
  vehicle: FuelVehicle;
  onClose: () => void;
}) {
  const updateFuelVehicle = useUpdateFuelVehicle(company);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      plate: vehicle.plate ?? "",
      brand: vehicle.brand ?? "",
      model: vehicle.model ?? "",
      color: vehicle.color ?? "",
      type: (vehicle.type as FuelVehicleType) ?? "truck",
      type_other: vehicle.type_other ?? "",
      fuel_type: (vehicle.fuel_type as FuelType) ?? "GASOLINE",
      responsible: vehicle.responsible ?? "",
      tank_capacity_liters: Number(vehicle.tank_capacity_liters ?? 0),
      km_per_liter: Number(vehicle.km_per_liter ?? 0),
      initial_km: Number(vehicle.initial_km ?? 0),
    },
  });

  const watchedType = form.watch("type");

  const onSubmit = async (values: FormValues) => {
    // Guard de UI: la capacidad no puede quedar por debajo del saldo actual
    // (el backend tambien lo valida).
    if (values.tank_capacity_liters < Number(vehicle.current_balance_liters)) {
      form.setError("tank_capacity_liters", {
        message: `No puede ser menor al saldo actual (${formatLiters(
          vehicle.current_balance_liters,
        )}).`,
      });
      return;
    }

    try {
      await updateFuelVehicle.mutateAsync({
        id: vehicle.id,
        data: {
          plate: values.plate?.trim().toUpperCase() || null,
          brand: values.brand?.trim() || null,
          model: values.model?.trim() || null,
          color: values.color?.trim() || null,
          type: values.type as FuelVehicleType,
          type_other:
            values.type === "other" ? values.type_other?.trim() || null : null,
          fuel_type: values.fuel_type as FuelType,
          responsible: values.responsible?.trim() || null,
          tank_capacity_liters: values.tank_capacity_liters,
          km_per_liter: values.km_per_liter || null,
          initial_km: values.initial_km || null,
        },
      });
      onClose();
    } catch (error) {
      applyFuelValidationErrors(error, (field, message) =>
        form.setError(field as keyof FormValues, { message }),
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="plate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Placa (opcional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: A12BC3"
                    className="uppercase"
                    {...field}
                    onChange={(event) =>
                      field.onChange(event.target.value.toUpperCase())
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {FUEL_VEHICLE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fuel_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Combustible</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {FUEL_TYPES.map((fuelType) => (
                      <SelectItem key={fuelType.value} value={fuelType.value}>
                        {fuelType.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {watchedType === "other" ? (
          <FormField
            control={form.control}
            name="type_other"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Especificar tipo</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Montacargas" maxLength={100} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marca (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Toyota" maxLength={100} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modelo (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Hilux" maxLength={100} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Blanco" maxLength={50} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="responsible"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Responsable / conductor</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Opcional"
                  className="min-h-20 resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="tank_capacity_liters"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacidad del tanque</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
                <FormDescription>
                  Saldo actual: {formatLiters(vehicle.current_balance_liters)}{" "}
                  (no editable aqui).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="km_per_liter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rendimiento (km/L)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Ej: 10.5"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="initial_km"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kilometraje inicial</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ej: 15000"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={updateFuelVehicle.isPending || !company}
        >
          {updateFuelVehicle.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Guardar cambios"
          )}
        </Button>
      </form>
    </Form>
  );
}
