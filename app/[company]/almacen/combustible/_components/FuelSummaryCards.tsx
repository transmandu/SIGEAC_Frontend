"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatLiters } from "@/lib/fuel";
import { cn } from "@/lib/utils";
import { FuelSummary } from "@/types";
import { Droplets, Truck, Warehouse } from "lucide-react";

export function FuelSummaryCards({ summary }: { summary?: FuelSummary }) {
  const warehouseLiters = Number(summary?.warehouse_balance_liters ?? 0);
  const vehicleLiters = Number(summary?.vehicle_balance_liters ?? 0);
  const vehicleLitersAll = Number(summary?.vehicle_balance_liters_all ?? 0);
  const inactiveLiters = Math.max(vehicleLitersAll - vehicleLiters, 0);
  // Se conserva para el calculo de proporciones de la barra; ya no se
  // muestra como cifra agregada (redundaba con los dos valores de abajo).
  const totalLiters = warehouseLiters + vehicleLiters;
  const warehousePct = totalLiters > 0 ? (warehouseLiters / totalLiters) * 100 : 0;
  const vehiclePct = totalLiters > 0 ? 100 - warehousePct : 0;
  const activeVehicles = summary?.active_vehicle_count ?? 0;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center justify-between gap-4 border-b bg-muted/30 px-5 py-3">
          <div className="flex items-center gap-2">
            <Droplets className="h-3.5 w-3.5 text-primary" />
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Combustible disponible
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-mono text-xs font-semibold tabular-nums">
              {activeVehicles}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {activeVehicles === 1 ? "vehiculo activo" : "vehiculos activos"}
            </span>
          </div>
        </div>

        {totalLiters === 0 ? (
          <p className="px-5 py-6 text-sm text-muted-foreground">
            Sin combustible registrado. Comienza con el saldo inicial del
            almacen.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              <div className="relative px-5 py-4">
                <span className="absolute inset-y-0 left-0 w-1 bg-primary" />
                <div className="flex items-center gap-1.5 pl-2 text-muted-foreground">
                  <Warehouse className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium uppercase tracking-wide">
                    En almacen
                  </span>
                </div>
                <p className="mt-1 pl-2 font-mono text-3xl font-bold tabular-nums tracking-tight">
                  {formatLiters(warehouseLiters)}
                </p>
                <p className="mt-0.5 pl-2 text-xs text-muted-foreground">
                  {Math.round(warehousePct)}% del disponible
                </p>
              </div>

              <div className="relative px-5 py-4">
                <span className="absolute inset-y-0 left-0 w-1 bg-primary/35" />
                <div className="flex items-center gap-1.5 pl-2 text-muted-foreground">
                  <Truck className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium uppercase tracking-wide">
                    En vehiculos
                  </span>
                </div>
                <p className="mt-1 pl-2 font-mono text-3xl font-bold tabular-nums tracking-tight">
                  {formatLiters(vehicleLiters)}
                </p>
                <p className="mt-0.5 pl-2 text-xs text-muted-foreground">
                  {Math.round(vehiclePct)}% del disponible
                  {inactiveLiters > 0 && (
                    <span className="text-muted-foreground/70">
                      {" "}
                      · +{formatLiters(inactiveLiters)} en inactivos
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className={cn("flex h-1", "bg-muted")}>
              <div
                className="bg-primary transition-[width] duration-300 ease-out"
                style={{ width: `${warehousePct}%` }}
              />
              <div
                className="bg-primary/35 transition-[width] duration-300 ease-out"
                style={{ width: `${vehiclePct}%` }}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
