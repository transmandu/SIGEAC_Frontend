"use client";

import { FuelMovementDetailDialog } from "@/components/dialogs/mantenimiento/almacen/combustible/FuelMovementDetailDialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatLiters, getFuelMovementLabel } from "@/lib/fuel";
import { FuelMovement, FuelVehicle } from "@/types";
import { format } from "date-fns";
import { Route } from "lucide-react";
import { useMemo } from "react";

export function FuelTraceabilityPanel({
  company,
  movements,
  vehicles = [],
}: {
  company?: string;
  movements: FuelMovement[];
  vehicles?: FuelVehicle[];
}) {
  const dispatches = movements.filter((movement) =>
    ["warehouse_dispatch_vehicle", "warehouse_dispatch_third_party"].includes(
      movement.type,
    ),
  );

  // El vehiculo anidado en el movimiento puede venir sin brand/model/color;
  // se completa con el listado ya cargado en la pagina.
  const vehiclesById = useMemo(
    () => new Map(vehicles.map((vehicle) => [vehicle.id, vehicle])),
    [vehicles],
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="rounded-md border bg-muted/50 p-2 text-primary">
          <Route className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold">Despachos trazables</p>
          <p className="text-xs text-muted-foreground">
            Abre un despacho para consultar las entradas FIFO consumidas.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Destino</TableHead>
              <TableHead className="text-right">Litros</TableHead>
              <TableHead className="text-right">Detalle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dispatches.length ? (
              dispatches.map((movement) => {
                const vehicle = movement.vehicle
                  ? vehiclesById.get(movement.vehicle.id) ?? movement.vehicle
                  : null;
                return (
                <TableRow key={movement.id}>
                  <TableCell className="font-medium">
                    {format(movement.operational_date, "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>{getFuelMovementLabel(movement.type)}</TableCell>
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
                      movement.third_party?.name || "Sin destino"
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {formatLiters(movement.liters)}
                  </TableCell>
                  <TableCell className="text-right">
                    <FuelMovementDetailDialog
                      company={company}
                      movement={movement}
                    />
                  </TableCell>
                </TableRow>
                );
              })
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="h-36">
                  <div className="flex flex-col items-center justify-center gap-1 text-center">
                    <Route className="h-5 w-5 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      Sin despachos trazables
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Los despachos a vehiculos o terceros apareceran aqui con
                      su detalle FIFO.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
