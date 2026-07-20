"use client";

import { AnnulFuelMovementDialog } from "@/components/dialogs/mantenimiento/almacen/combustible/AnnulFuelMovementDialog";
import { DeleteFuelMovementDialog } from "@/components/dialogs/mantenimiento/almacen/combustible/DeleteFuelMovementDialog";
import { FuelMovementDetailDialog } from "@/components/dialogs/mantenimiento/almacen/combustible/FuelMovementDetailDialog";
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
  getFuelMovementLabel,
  getFuelStatusLabel,
  getFuelTypeLabel,
} from "@/lib/fuel";
import { cn } from "@/lib/utils";
import { FuelMovement, FuelMovementType, FuelVehicle } from "@/types";
import { format } from "date-fns";
import { Fuel } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo } from "react";

// Color por flujo: entrada / despacho / consumo / anulacion
const MOVEMENT_DOT_CLASS: Record<FuelMovementType, string> = {
  warehouse_initial_balance: "bg-emerald-500",
  vehicle_initial_balance: "bg-emerald-500",
  external_refuel: "bg-emerald-500",
  warehouse_unload: "bg-emerald-500",
  warehouse_dispatch_vehicle: "bg-primary",
  warehouse_dispatch_third_party: "bg-primary",
  vehicle_daily_consumption: "bg-amber-500",
  vehicle_trip: "bg-amber-500",
  annulment: "bg-destructive",
};

export function FuelMovementsTable({
  company,
  movements,
  vehicles = [],
  isSuperUser = false,
}: {
  company?: string;
  movements: FuelMovement[];
  vehicles?: FuelVehicle[];
  isSuperUser?: boolean;
}) {
  // El vehiculo anidado en el movimiento puede venir sin brand/model/color
  // (segun lo que exponga el backend); se completa con el listado de
  // vehiculos ya cargado en la pagina, que si trae esos campos.
  const vehiclesById = useMemo(
    () => new Map(vehicles.map((vehicle) => [vehicle.id, vehicle])),
    [vehicles],
  );

  return (
    <div className="overflow-hidden rounded-xl bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Fecha</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Destino / origen</TableHead>
            <TableHead>Combustible</TableHead>
            <TableHead>Finalidad</TableHead>
            <TableHead className="text-right">Litros</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-center">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.length ? (
            <AnimatePresence initial={false} mode="popLayout">
              {movements.map((movement, index) => {
              const isAnnulled = movement.status === "annulled";
              const vehicle = movement.vehicle
                ? vehiclesById.get(movement.vehicle.id) ?? movement.vehicle
                : null;
              return (
                <motion.tr
                  key={movement.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{
                    duration: 0.22,
                    ease: "easeOut",
                    delay: Math.min(index, 10) * 0.025,
                  }}
                  className={cn(
                    "group border-b transition-colors hover:bg-muted/50",
                    isAnnulled && "text-muted-foreground",
                  )}
                >
                  <TableCell className="font-medium">
                    {format(movement.operational_date, "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-2">
                      <span
                        className={cn(
                          "h-1.5 w-1.5 shrink-0 rounded-full",
                          MOVEMENT_DOT_CLASS[movement.type],
                          isAnnulled && "opacity-40",
                        )}
                      />
                      {getFuelMovementLabel(movement.type)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {vehicle ? (
                      <div className="flex flex-col">
                        <span>{vehicle.plate || "Sin placa"}</span>
                        {(vehicle.brand || vehicle.model || vehicle.color) && (
                          <span className="text-xs text-muted-foreground">
                            {[vehicle.brand, vehicle.model, vehicle.color]
                              .filter(Boolean)
                              .join(" ")}
                          </span>
                        )}
                      </div>
                    ) : (
                      movement.third_party?.name || "Almacen"
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {getFuelTypeLabel(movement.fuel_type)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "max-w-[260px] truncate",
                      !movement.dispatch_purpose && "text-muted-foreground",
                    )}
                  >
                    {movement.dispatch_purpose || "—"}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-mono tabular-nums",
                      isAnnulled && "line-through",
                    )}
                  >
                    {formatLiters(movement.liters)}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          isAnnulled ? "bg-destructive" : "bg-emerald-500",
                        )}
                      />
                      {getFuelStatusLabel(movement.status)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <FuelMovementDetailDialog
                        company={company}
                        movement={movement}
                      />
                      <AnnulFuelMovementDialog
                        company={company}
                        movement={movement}
                      />
                      {isSuperUser && isAnnulled && (
                        <DeleteFuelMovementDialog
                          company={company}
                          movement={movement}
                        />
                      )}
                    </div>
                  </TableCell>
                </motion.tr>
              );
              })}
            </AnimatePresence>
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={8} className="h-36">
                <div className="flex flex-col items-center justify-center gap-1 text-center">
                  <Fuel className="h-5 w-5 text-muted-foreground" />
                  <p className="text-sm font-medium">Sin movimientos</p>
                  <p className="text-xs text-muted-foreground">
                    Registra una entrada o despacho, o ajusta los filtros.
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
