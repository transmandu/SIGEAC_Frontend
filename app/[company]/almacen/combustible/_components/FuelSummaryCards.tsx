"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatLiters } from "@/lib/fuel";
import { FuelSummary } from "@/types";
import { Truck } from "lucide-react";

export function FuelSummaryCards({ summary }: { summary?: FuelSummary }) {
  const warehouseLiters = Number(summary?.warehouse_balance_liters ?? 0);
  const vehicleLiters = Number(summary?.vehicle_balance_liters ?? 0);
  const vehicleLitersAll = Number(summary?.vehicle_balance_liters_all ?? 0);
  const inactiveLiters = Math.max(vehicleLitersAll - vehicleLiters, 0);
  const totalLiters = warehouseLiters + vehicleLiters;
  const warehousePct = totalLiters > 0 ? (warehouseLiters / totalLiters) * 100 : 0;
  const vehiclePct = totalLiters > 0 ? 100 - warehousePct : 0;
  const activeVehicles = summary?.active_vehicle_count ?? 0;

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Combustible total
            </p>
            <p className="mt-1 font-mono text-3xl font-bold tabular-nums tracking-tight">
              {formatLiters(totalLiters)}
            </p>
          </div>
          <div className="flex items-center gap-2.5 rounded-md border bg-muted/40 px-3 py-2">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-mono text-sm font-semibold tabular-nums leading-none">
                {activeVehicles}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {activeVehicles === 1 ? "Vehiculo activo" : "Vehiculos activos"}
              </p>
            </div>
          </div>
        </div>

        {/* Nivel de tanque: distribucion almacen / vehiculos */}
        <div className="space-y-2.5">
          <div className="flex h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="bg-primary transition-[width] duration-300 ease-out"
              style={{ width: `${warehousePct}%` }}
            />
            <div
              className="bg-primary/35 transition-[width] duration-300 ease-out"
              style={{ width: `${vehiclePct}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-muted-foreground">Almacen</span>
              <span className="font-mono font-medium tabular-nums">
                {formatLiters(warehouseLiters)}
              </span>
              {totalLiters > 0 && (
                <span className="text-xs text-muted-foreground">
                  ({Math.round(warehousePct)}%)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary/35" />
              <span className="text-muted-foreground">En vehiculos</span>
              <span className="font-mono font-medium tabular-nums">
                {formatLiters(vehicleLiters)}
              </span>
              {totalLiters > 0 && (
                <span className="text-xs text-muted-foreground">
                  ({Math.round(vehiclePct)}%)
                </span>
              )}
              {inactiveLiters > 0 && (
                <span className="text-xs text-muted-foreground">
                  (+{formatLiters(inactiveLiters)} en inactivos)
                </span>
              )}
            </div>
            {totalLiters === 0 && (
              <span className="text-xs text-muted-foreground">
                Sin combustible registrado. Comienza con el saldo inicial del
                almacen.
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
