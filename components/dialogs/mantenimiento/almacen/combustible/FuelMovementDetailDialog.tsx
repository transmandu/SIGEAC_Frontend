"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useGetFuelTraceability } from "@/hooks/mantenimiento/almacen/combustible/useGetFuelTraceability";
import {
  formatLiters,
  getFuelMovementLabel,
  getFuelStatusLabel,
} from "@/lib/fuel";
import { FuelMovement } from "@/types";
import { Eye, Loader2 } from "lucide-react";
import { useState } from "react";

const hasTraceability = (movement: FuelMovement) =>
  ["warehouse_dispatch_vehicle", "warehouse_dispatch_third_party"].includes(
    movement.type,
  );

export function FuelMovementDetailDialog({
  company,
  movement,
}: {
  company?: string;
  movement: FuelMovement;
}) {
  const [open, setOpen] = useState(false);
  const { data: traceability, isLoading } = useGetFuelTraceability(
    company,
    open && hasTraceability(movement) ? movement.id : null,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-2">
          <Eye className="h-4 w-4" />
          Detalle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[680px]">
        <DialogHeader>
          <DialogTitle>{getFuelMovementLabel(movement.type)}</DialogTitle>
          <DialogDescription>
            Movimiento #{movement.id} - {getFuelStatusLabel(movement.status)}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 rounded-md border p-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Fecha operativa</p>
            <p className="font-medium">{movement.operational_date}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Litros</p>
            <p className="font-medium">{formatLiters(movement.liters)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Vehiculo</p>
            <p className="font-medium">{movement.vehicle?.plate ?? "No aplica"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tercero</p>
            <p className="font-medium">{movement.third_party?.name ?? "No aplica"}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-muted-foreground">Finalidad del despacho</p>
            <p className="font-medium">
              {movement.dispatch_purpose || "No aplica"}
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-muted-foreground">Observacion</p>
            <p className="font-medium">{movement.observation || "Sin observacion"}</p>
          </div>
        </div>

        {hasTraceability(movement) ? (
          <div className="space-y-3">
            <Separator />
            <div>
              <p className="text-sm font-semibold">Trazabilidad FIFO</p>
              <p className="text-xs text-muted-foreground">
                Entradas consumidas por este despacho.
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando trazabilidad...
              </div>
            ) : traceability?.fifo_rows?.length ? (
              <div className="overflow-hidden rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Entrada</th>
                      <th className="px-3 py-2 text-left font-medium">Origen</th>
                      <th className="px-3 py-2 text-right font-medium">Tomados</th>
                      <th className="px-3 py-2 text-right font-medium">Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {traceability.fifo_rows.map((row) => (
                      <tr key={`${row.entry_movement_id}-${row.liters_taken}`} className="border-t">
                        <td className="px-3 py-2">
                          #{row.entry_movement_id} - {row.entry_operational_date}
                        </td>
                        <td className="px-3 py-2">
                          {row.source_vehicle?.plate ?? getFuelMovementLabel(row.entry_type)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {formatLiters(row.liters_taken)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {formatLiters(row.remaining_liters_after_dispatch)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                No hay detalle FIFO disponible para este movimiento.
              </p>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
