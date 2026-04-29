"use client";

import { useCreateFuelMovement } from "@/actions/mantenimiento/almacen/combustible/actions";
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
import { useGetThirdParties } from "@/hooks/general/terceros/useGetThirdParties";
import {
  FUEL_MOVEMENT_DESCRIPTIONS,
  FUEL_MOVEMENT_LABELS,
  formatLiters,
} from "@/lib/fuel";
import {
  FuelMovementType,
  FuelSummary,
  FuelVehicle,
  ThirdParty,
} from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  operational_date: z.string().min(1, "La fecha es requerida"),
  liters: z.coerce.number().positive("Los litros deben ser mayores a 0"),
  vehicle_id: z.string().optional(),
  third_party_id: z.string().optional(),
  dispatch_purpose: z.string().optional(),
  observation: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const needsVehicle = (type: FuelMovementType) =>
  [
    "external_refuel",
    "warehouse_unload",
    "warehouse_dispatch_vehicle",
    "vehicle_daily_consumption",
  ].includes(type);

const needsThirdParty = (type: FuelMovementType) =>
  type === "warehouse_dispatch_third_party";

const needsDispatchPurpose = (type: FuelMovementType) =>
  ["warehouse_dispatch_vehicle", "warehouse_dispatch_third_party"].includes(
    type,
  );

const findVehicle = (vehicles: FuelVehicle[], id?: string) =>
  vehicles.find((vehicle) => vehicle.id.toString() === id) ?? null;

export function FuelMovementForm({
  company,
  type,
  summary,
  vehicles,
  onClose,
}: {
  company?: string;
  type: FuelMovementType;
  summary?: FuelSummary;
  vehicles: FuelVehicle[];
  onClose: () => void;
}) {
  const createFuelMovement = useCreateFuelMovement(company);
  const { data: thirdParties, isLoading: thirdPartiesLoading } =
    useGetThirdParties();

  const activeVehicles = useMemo(
    () => vehicles.filter((vehicle) => vehicle.status === "active"),
    [vehicles],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      operational_date: format(new Date(), "yyyy-MM-dd"),
      liters: 0,
      vehicle_id: "",
      third_party_id: "",
      dispatch_purpose: "",
      observation: "",
    },
  });

  const selectedVehicle = findVehicle(activeVehicles, form.watch("vehicle_id"));

  const validateMovement = (values: FormValues) => {
    if (needsVehicle(type) && !values.vehicle_id) {
      form.setError("vehicle_id", { message: "Debe seleccionar un vehiculo" });
      return false;
    }

    if (needsThirdParty(type) && !values.third_party_id) {
      form.setError("third_party_id", { message: "Debe seleccionar un tercero" });
      return false;
    }

    if (needsDispatchPurpose(type) && !values.dispatch_purpose?.trim()) {
      form.setError("dispatch_purpose", {
        message: "Debe indicar para que fue realizado el despacho",
      });
      return false;
    }

    if (
      ["warehouse_dispatch_vehicle", "warehouse_dispatch_third_party"].includes(
        type,
      ) &&
      summary &&
      values.liters > Number(summary.warehouse_balance_liters)
    ) {
      form.setError("liters", {
        message: `Disponible en almacen: ${formatLiters(summary.warehouse_balance_liters)}`,
      });
      return false;
    }

    if (
      ["warehouse_unload", "vehicle_daily_consumption"].includes(type) &&
      selectedVehicle &&
      values.liters > Number(selectedVehicle.current_balance_liters)
    ) {
      form.setError("liters", {
        message: `Saldo del vehiculo: ${formatLiters(selectedVehicle.current_balance_liters)}`,
      });
      return false;
    }

    if (
      ["external_refuel", "warehouse_dispatch_vehicle"].includes(type) &&
      selectedVehicle &&
      Number(selectedVehicle.current_balance_liters) + values.liters >
        Number(selectedVehicle.tank_capacity_liters)
    ) {
      form.setError("liters", {
        message: `Capacidad disponible: ${formatLiters(
          Number(selectedVehicle.tank_capacity_liters) -
            Number(selectedVehicle.current_balance_liters),
        )}`,
      });
      return false;
    }

    return true;
  };

  const onSubmit = async (values: FormValues) => {
    if (!validateMovement(values)) return;

    await createFuelMovement.mutateAsync({
      type,
      operational_date: values.operational_date,
      liters: values.liters,
      vehicle_id: values.vehicle_id ? Number(values.vehicle_id) : null,
      third_party_id: values.third_party_id || null,
      dispatch_purpose: values.dispatch_purpose?.trim() || null,
      observation: values.observation?.trim() || null,
    });
    form.reset();
    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="rounded-md border bg-muted/30 p-3">
          <p className="text-sm font-medium">{FUEL_MOVEMENT_LABELS[type]}</p>
          <p className="text-xs text-muted-foreground">
            {FUEL_MOVEMENT_DESCRIPTIONS[type]}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="operational_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha operativa</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="liters"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Litros</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {needsVehicle(type) ? (
          <FormField
            control={form.control}
            name="vehicle_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehiculo</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un vehiculo..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {activeVehicles.length === 0 ? (
                      <SelectItem value="empty" disabled>
                        No hay vehiculos activos
                      </SelectItem>
                    ) : null}
                    {activeVehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                        {vehicle.plate} - {formatLiters(vehicle.current_balance_liters)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedVehicle ? (
                  <p className="text-xs text-muted-foreground">
                    Capacidad {formatLiters(selectedVehicle.tank_capacity_liters)}
                  </p>
                ) : null}
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}

        {needsThirdParty(type) ? (
          <FormField
            control={form.control}
            name="third_party_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tercero</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={thirdPartiesLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un tercero..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {thirdParties?.map((thirdParty: ThirdParty) => (
                      <SelectItem key={thirdParty.id} value={thirdParty.id}>
                        {thirdParty.name}
                        {thirdParty.type ? ` - ${thirdParty.type}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}

        {needsDispatchPurpose(type) ? (
          <FormField
            control={form.control}
            name="dispatch_purpose"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Finalidad del despacho</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ej: BUSQUEDA DE MATERIALES EN FERRETERIA"
                    className="min-h-20 resize-none uppercase"
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
        ) : null}

        <FormField
          control={form.control}
          name="observation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observacion</FormLabel>
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

        <Button
          type="submit"
          className="w-full"
          disabled={createFuelMovement.isPending || !company}
        >
          {createFuelMovement.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Registrar movimiento"
          )}
        </Button>
      </form>
    </Form>
  );
}
