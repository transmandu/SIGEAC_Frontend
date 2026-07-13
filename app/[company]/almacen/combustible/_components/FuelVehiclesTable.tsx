"use client";

import { useUpdateFuelVehicleStatus } from "@/actions/mantenimiento/almacen/combustible/actions";
import { DeleteFuelVehicleDialog } from "@/components/dialogs/mantenimiento/almacen/combustible/DeleteFuelVehicleDialog";
import { EditFuelVehicleDialog } from "@/components/dialogs/mantenimiento/almacen/combustible/EditFuelVehicleDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatLiters,
  getFuelStatusLabel,
  getFuelVehicleTypeLabel,
  isPendingFuelVehiclePlate,
} from "@/lib/fuel";
import { cn } from "@/lib/utils";
import { FuelVehicle } from "@/types";
import { Loader2, Power, PowerOff, Truck } from "lucide-react";

export function FuelVehiclesTable({
  company,
  vehicles,
  isSuperUser = false,
}: {
  company?: string;
  vehicles: FuelVehicle[];
  isSuperUser?: boolean;
}) {
  const updateStatus = useUpdateFuelVehicleStatus(company);
  const pendingVehicleId = updateStatus.isPending
    ? updateStatus.variables
    : null;

  const toggleStatus = (vehicle: FuelVehicle) => {
    updateStatus.mutate(vehicle.id);
  };

  return (
    <div className="overflow-hidden rounded-md border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Placa</TableHead>
            <TableHead>Vehiculo</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Responsable</TableHead>
            <TableHead className="text-right">Capacidad</TableHead>
            <TableHead className="text-right">Saldo</TableHead>
            <TableHead className="text-right">km/L</TableHead>
            <TableHead className="text-right">KM inicial</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Accion</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.length ? (
            vehicles.map((vehicle) => {
              const isInactive = vehicle.status === "inactive";
              const tankPct =
                vehicle.tank_capacity_liters > 0
                  ? Math.min(
                      100,
                      (vehicle.current_balance_liters /
                        vehicle.tank_capacity_liters) *
                        100,
                    )
                  : 0;
              return (
                <TableRow
                  key={vehicle.id}
                  className={cn(isInactive && "text-muted-foreground")}
                >
                  <TableCell className="font-semibold">
                    <div className="flex items-center gap-1.5">
                      {vehicle.plate}
                      {isPendingFuelVehiclePlate(vehicle.plate) && (
                        <Badge
                          variant="destructive"
                          className="text-[10px] font-normal"
                          title="Placa migrada de datos legacy: debe corregirse con la placa real"
                        >
                          Placa pendiente de corrección
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell
                    className={cn(
                      "max-w-[200px] truncate",
                      !vehicle.brand && !vehicle.model && !vehicle.color && "text-muted-foreground",
                    )}
                  >
                    {[vehicle.brand, vehicle.model, vehicle.color]
                      .filter(Boolean)
                      .join(" / ") || "-"}
                  </TableCell>
                  <TableCell>{getFuelVehicleTypeLabel(vehicle.type)}</TableCell>
                  <TableCell
                    className={cn(
                      "max-w-[220px] truncate",
                      !vehicle.responsible && "text-muted-foreground",
                    )}
                  >
                    {vehicle.responsible || "Sin responsable"}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {formatLiters(vehicle.tank_capacity_liters)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div
                      className="inline-flex flex-col items-end gap-1"
                      title={`${Math.round(tankPct)}% del tanque`}
                    >
                      <span className="font-mono font-medium tabular-nums">
                        {formatLiters(vehicle.current_balance_liters)}
                      </span>
                      <span className="h-1 w-16 overflow-hidden rounded-full bg-muted">
                        <span
                          className={cn(
                            "block h-full rounded-full transition-[width] duration-300 ease-out",
                            isInactive ? "bg-muted-foreground/40" : "bg-primary",
                          )}
                          style={{ width: `${tankPct}%` }}
                        />
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {vehicle.km_per_liter ? `${vehicle.km_per_liter}` : "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {vehicle.initial_km ? `${vehicle.initial_km}` : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={isInactive ? "secondary" : "default"}>
                      {getFuelStatusLabel(vehicle.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <EditFuelVehicleDialog
                        company={company}
                        vehicle={vehicle}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-2"
                        onClick={() => toggleStatus(vehicle)}
                        disabled={updateStatus.isPending}
                      >
                        {pendingVehicleId === vehicle.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isInactive ? (
                          <Power className="h-4 w-4" />
                        ) : (
                          <PowerOff className="h-4 w-4" />
                        )}
                        {isInactive ? "Activar" : "Inactivar"}
                      </Button>
                      {isSuperUser && (
                        <DeleteFuelVehicleDialog
                          company={company}
                          vehicle={vehicle}
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={10} className="h-36">
                <div className="flex flex-col items-center justify-center gap-1 text-center">
                  <Truck className="h-5 w-5 text-muted-foreground" />
                  <p className="text-sm font-medium">Sin vehiculos</p>
                  <p className="text-xs text-muted-foreground">
                    Registra el primero con el boton &quot;Vehiculo&quot; en la
                    parte superior.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
