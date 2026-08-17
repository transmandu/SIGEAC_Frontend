"use client";

import { useUpdateFuelVehicleStatus } from "@/actions/mantenimiento/almacen/combustible/actions";
import { DeleteFuelVehicleDialog } from "@/components/dialogs/mantenimiento/almacen/combustible/DeleteFuelVehicleDialog";
import { EditFuelVehicleDialog } from "@/components/dialogs/mantenimiento/almacen/combustible/EditFuelVehicleDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  getFuelTypeLabel,
  getFuelVehicleTypeDisplay,
  isPendingFuelVehiclePlate,
} from "@/lib/fuel";
import { cn } from "@/lib/utils";
import { FuelVehicle } from "@/types";
import {
  Loader2,
  MoreHorizontal,
  Pencil,
  Power,
  PowerOff,
  Trash2,
  Truck,
} from "lucide-react";
import { useState } from "react";

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

  const [editVehicleId, setEditVehicleId] = useState<number | null>(null);
  const [deleteVehicleId, setDeleteVehicleId] = useState<number | null>(null);

  const toggleStatus = (vehicle: FuelVehicle) => {
    updateStatus.mutate(vehicle.id);
  };

  return (
    <div className="overflow-hidden rounded-xl bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Placa</TableHead>
            <TableHead>Vehiculo</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Combustible</TableHead>
            <TableHead>Responsable</TableHead>
            <TableHead className="text-right">Capacidad</TableHead>
            <TableHead className="text-right">Saldo</TableHead>
            <TableHead className="text-right">km/L</TableHead>
            <TableHead className="text-right">KM inicial</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-center">Accion</TableHead>
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
                  className={cn("group", isInactive && "text-muted-foreground")}
                >
                  <TableCell className="font-semibold">
                    <div className="flex items-center gap-1.5">
                      {vehicle.plate || (
                        <span className="font-normal text-muted-foreground">
                          Sin placa
                        </span>
                      )}
                      {isPendingFuelVehiclePlate(vehicle.plate) && (
                        <span
                          className="rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-normal text-destructive"
                          title="Placa migrada de datos legacy: debe corregirse con la placa real"
                        >
                          Placa pendiente
                        </span>
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
                  <TableCell>{getFuelVehicleTypeDisplay(vehicle)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {getFuelTypeLabel(vehicle.fuel_type)}
                  </TableCell>
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
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          isInactive ? "bg-muted-foreground/50" : "bg-emerald-500",
                        )}
                      />
                      {getFuelStatusLabel(vehicle.status)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="gap-2"
                          onClick={() => setEditVehicleId(vehicle.id)}
                        >
                          <Pencil className="h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2"
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
                        </DropdownMenuItem>
                        {isSuperUser && (
                          <DropdownMenuItem
                            className="gap-2 text-destructive focus:text-destructive"
                            onClick={() => setDeleteVehicleId(vehicle.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <EditFuelVehicleDialog
                      company={company}
                      vehicle={vehicle}
                      open={editVehicleId === vehicle.id}
                      onOpenChange={(next) =>
                        setEditVehicleId(next ? vehicle.id : null)
                      }
                    />
                    {isSuperUser && (
                      <DeleteFuelVehicleDialog
                        company={company}
                        vehicle={vehicle}
                        open={deleteVehicleId === vehicle.id}
                        onOpenChange={(next) =>
                          setDeleteVehicleId(next ? vehicle.id : null)
                        }
                      />
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={11} className="h-36">
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
