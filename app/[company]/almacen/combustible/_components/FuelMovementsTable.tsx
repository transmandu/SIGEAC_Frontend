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
import { FuelMovement } from "@/types";
import { format } from "date-fns";

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
            movements.map((movement) => (
              <TableRow key={movement.id}>
                <TableCell className="font-medium">
                  {format(movement.operational_date, "dd/MM/yyyy")}
                </TableCell>
                <TableCell>{getFuelMovementLabel(movement.type)}</TableCell>
                <TableCell>
                  {movement.vehicle?.plate ||
                    movement.third_party?.name ||
                    "Almacen"}
                </TableCell>
                <TableCell className="max-w-[260px] truncate">
                  {movement.dispatch_purpose || "No aplica"}
                </TableCell>
                <TableCell className="text-right">
                  {formatLiters(movement.liters)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      movement.status === "annulled" ? "destructive" : "secondary"
                    }
                  >
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
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No hay movimientos registrados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
