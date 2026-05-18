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
import { FuelMovement } from "@/types";
import { Route } from "lucide-react";

export function FuelTraceabilityPanel({
  company,
  movements,
}: {
  company?: string;
  movements: FuelMovement[];
}) {
  const dispatches = movements.filter((movement) =>
    ["warehouse_dispatch_vehicle", "warehouse_dispatch_third_party"].includes(
      movement.type,
    ),
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
              dispatches.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell>{movement.operational_date}</TableCell>
                  <TableCell>{getFuelMovementLabel(movement.type)}</TableCell>
                  <TableCell>
                    {movement.vehicle?.plate ||
                      movement.third_party?.name ||
                      "Sin destino"}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatLiters(movement.liters)}
                  </TableCell>
                  <TableCell className="text-right">
                    <FuelMovementDetailDialog
                      company={company}
                      movement={movement}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No hay despachos con trazabilidad.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
