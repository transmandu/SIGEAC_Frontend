"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatLiters } from "@/lib/fuel";
import { FuelSummary } from "@/types";
import { Fuel, Gauge, Truck } from "lucide-react";

export function FuelSummaryCards({ summary }: { summary?: FuelSummary }) {
  const items = [
    {
      label: "Almacen disponible",
      value: formatLiters(summary?.warehouse_balance_liters),
      icon: Fuel,
      detail: "Stock listo para despacho",
    },
    {
      label: "En vehiculos",
      value: formatLiters(summary?.vehicle_balance_liters),
      icon: Gauge,
      detail: "Gasolina distribuida",
    },
    {
      label: "Vehiculos activos",
      value: summary?.active_vehicle_count ?? 0,
      icon: Truck,
      detail: "Habilitados para movimientos",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label} className="overflow-hidden">
          <CardContent className="flex items-center justify-between gap-4 p-5">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">
                {item.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
            </div>
            <div className="rounded-md border bg-muted/50 p-3 text-primary">
              <item.icon className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
