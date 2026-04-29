"use client";

import { useCreateFuelVehicle } from "@/actions/mantenimiento/almacen/combustible/actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import { FUEL_VEHICLE_TYPES } from "@/lib/fuel";
import { FuelVehicleType } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z
  .object({
    plate: z.string().min(1, "La placa es requerida"),
    type: z.enum(["car", "truck", "motorcycle", "other"], {
      required_error: "Debe seleccionar un tipo",
    }),
    responsible: z.string().optional(),
    tank_capacity_liters: z.coerce
      .number()
      .positive("La capacidad debe ser mayor a 0"),
    initial_balance_liters: z.coerce
      .number()
      .min(0, "El saldo inicial no puede ser negativo"),
  })
  .refine(
    (data) => data.initial_balance_liters <= data.tank_capacity_liters,
    {
      message: "El saldo inicial no puede superar la capacidad",
      path: ["initial_balance_liters"],
    },
  );

type FormValues = z.infer<typeof formSchema>;

export function CreateFuelVehicleForm({
  company,
  onClose,
}: {
  company?: string;
  onClose: () => void;
}) {
  const createFuelVehicle = useCreateFuelVehicle(company);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      plate: "",
      type: "truck",
      responsible: "",
      tank_capacity_liters: 0,
      initial_balance_liters: 0,
    },
  });

  const onSubmit = async (values: FormValues) => {
    await createFuelVehicle.mutateAsync({
      ...values,
      plate: values.plate.trim().toUpperCase(),
      type: values.type as FuelVehicleType,
      responsible: values.responsible?.trim() || null,
    });
    form.reset();
    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="plate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Placa</FormLabel>
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
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="initial_balance_liters"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Saldo actual inicial</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={createFuelVehicle.isPending || !company}
        >
          {createFuelVehicle.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Registrar vehiculo"
          )}
        </Button>
      </form>
    </Form>
  );
}
