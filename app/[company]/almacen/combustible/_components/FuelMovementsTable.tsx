"use client";

import { AnnulFuelMovementDialog } from "@/components/dialogs/mantenimiento/almacen/combustible/AnnulFuelMovementDialog";
import { FuelMovementDetailDialog } from "@/components/dialogs/mantenimiento/almacen/combustible/FuelMovementDetailDialog";
import { Badge } from "@/components/ui/badge";
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
} from "@/lib/fuel";
import { cn } from "@/lib/utils";
import { FuelMovement, FuelMovementType } from "@/types";
import { format } from "date-fns";
import { Fuel } from "lucide-react";

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
}: {
  company?: string;
  movements: FuelMovement[];
}) {
  return (
    <div className="overflow-hidden rounded-md border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Destino / origen</TableHead>
            <TableHead>Finalidad</TableHead>
            <TableHead className="text-right">Litros</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.length ? (
            movements.map((movement) => {
              const isAnnulled = movement.status === "annulled";
              return (
                <TableRow
                  key={movement.id}
                  className={cn(isAnnulled && "text-muted-foreground")}
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
                    {movement.vehicle?.plate ||
                      movement.third_party?.name ||
                      "Almacen"}
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
                    <Badge variant={isAnnulled ? "destructive" : "secondary"}>
                      {getFuelStatusLabel(movement.status)}
                    </Badge>
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
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={7} className="h-36">
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
