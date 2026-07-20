"use client";

import { FUEL_TYPES, formatLiters, getFuelTypeLabel } from "@/lib/fuel";
import { cn } from "@/lib/utils";
import { FuelSummary, FuelType } from "@/types";
import {
  AlertCircle,
  ChevronRight,
  Droplet,
  Flame,
  Truck,
  Warehouse,
} from "lucide-react";

type Scope = "warehouse" | "vehicle";

const SCOPE_META: Record<Scope, { label: string; icon: typeof Warehouse }> = {
  warehouse: { label: "En almacen", icon: Warehouse },
  vehicle: { label: "En vehiculos", icon: Truck },
};

// Paleta por combustible: ambar/naranja para gasolina, esmeralda/teal para
// gasoil. Cada tono queda escrito completo (Tailwind no arma clases por
// interpolacion de variables).
const FUEL_ACCENT: Record<
  FuelType,
  {
    icon: typeof Flame;
    card: string;
    title: string;
    badge: string;
    divider: string;
    barWarehouse: string;
    barVehicle: string;
  }
> = {
  GASOLINE: {
    icon: Flame,
    card: "border-amber-200/70 bg-gradient-to-br from-amber-50 to-orange-50/40 dark:border-amber-500/20 dark:from-amber-500/10 dark:to-orange-500/5",
    title: "text-amber-700 dark:text-amber-400",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    divider: "divide-amber-200/60 dark:divide-amber-500/20",
    barWarehouse: "bg-gradient-to-r from-orange-600 to-amber-500",
    barVehicle: "bg-gradient-to-r from-amber-400 to-yellow-300",
  },
  DIESEL: {
    icon: Droplet,
    card: "border-emerald-200/70 bg-gradient-to-br from-emerald-50 to-teal-50/40 dark:border-emerald-500/20 dark:from-emerald-500/10 dark:to-teal-500/5",
    title: "text-emerald-700 dark:text-emerald-400",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    divider: "divide-emerald-200/60 dark:divide-emerald-500/20",
    barWarehouse: "bg-gradient-to-r from-emerald-600 to-emerald-500",
    barVehicle: "bg-gradient-to-r from-teal-400 to-teal-300",
  },
};

function GroupedFuelCard({
  fuelType,
  summary,
}: {
  fuelType: FuelType;
  summary?: FuelSummary;
}) {
  const accent = FUEL_ACCENT[fuelType];
  const Icon = accent.icon;
  const warehouseLiters = Number(
    summary?.warehouse_balance_liters?.[fuelType] ?? 0,
  );
  const vehicleLiters = Number(summary?.vehicle_balance_liters?.[fuelType] ?? 0);
  const totalLiters = warehouseLiters + vehicleLiters;
  const warehousePct = totalLiters > 0 ? (warehouseLiters / totalLiters) * 100 : 0;
  const vehiclePct = totalLiters > 0 ? 100 - warehousePct : 0;
  const hasInitialBalance =
    summary?.has_active_warehouse_initial_balance?.[fuelType] ?? false;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border shadow-sm",
        accent.card,
      )}
    >
      <div className="flex items-center justify-between gap-2 px-5 pt-4">
        <div className={cn("flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide", accent.title)}>
          <Icon className="h-3.5 w-3.5" />
          {getFuelTypeLabel(fuelType)} disponible
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-[10px] font-bold tabular-nums",
            accent.badge,
          )}
        >
          Total: {formatLiters(totalLiters)}
        </span>
      </div>

      <div className={cn("mt-3 grid grid-cols-2 divide-x", accent.divider)}>
        {(["warehouse", "vehicle"] as Scope[]).map((scope) => {
          const { label, icon: ScopeIcon } = SCOPE_META[scope];
          const liters = scope === "warehouse" ? warehouseLiters : vehicleLiters;
          const pct = scope === "warehouse" ? warehousePct : vehiclePct;
          return (
            <div key={scope} className="space-y-1 px-5 py-3">
              <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                <ScopeIcon className="h-3 w-3" />
                {label}
              </div>
              <p className="font-mono text-xl font-bold tabular-nums tracking-tight">
                {formatLiters(liters)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {Math.round(pct)}% del disponible
              </p>
              {scope === "warehouse" && !hasInitialBalance ? (
                <p className="flex items-center gap-1 pt-0.5 text-[10px] text-muted-foreground">
                  <AlertCircle className="h-2.5 w-2.5" />
                  Sin saldo inicial
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex h-1.5 w-full">
        <div
          className={cn("h-full transition-[width] duration-300 ease-out", accent.barWarehouse)}
          style={{ width: `${warehousePct}%` }}
        />
        <div
          className={cn("h-full transition-[width] duration-300 ease-out", accent.barVehicle)}
          style={{ width: `${vehiclePct}%` }}
        />
      </div>
    </div>
  );
}

export function FuelSummaryCards({
  summary,
  onViewVehicles,
}: {
  summary?: FuelSummary;
  onViewVehicles?: () => void;
}) {
  const activeVehicles = summary?.active_vehicle_count ?? 0;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        {onViewVehicles ? (
          <button
            type="button"
            onClick={onViewVehicles}
            className="group flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="font-mono font-semibold tabular-nums text-foreground">
              {activeVehicles}
            </span>
            <span>
              {activeVehicles === 1 ? "vehiculo operativo activo" : "vehiculos operativos activos"}
            </span>
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="font-mono font-semibold tabular-nums text-foreground">
              {activeVehicles}
            </span>
            <span>
              {activeVehicles === 1 ? "vehiculo operativo activo" : "vehiculos operativos activos"}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {FUEL_TYPES.map(({ value: fuelType }) => (
          <GroupedFuelCard key={fuelType} fuelType={fuelType} summary={summary} />
        ))}
      </div>
    </div>
  );
}
