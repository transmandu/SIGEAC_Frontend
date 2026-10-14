"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Cog,
  FileBadge,
  Gauge,
  Plane,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";
import {
  ControlAlertType,
  CriticalAlert,
  MaintenanceWarningMeta,
} from "@/hooks/alerts/types";
import { fmtNumber } from "@/lib/maintenanceControlCalc";

const UNIT_LABEL: Record<string, string> = {
  HOURS: "horas",
  CYCLES: "ciclos",
  DAYS: "días",
};

const CONTROL_META: Record<
  ControlAlertType,
  { label: string; icon: LucideIcon }
> = {
  maintenance: { label: "Mantenimiento", icon: Wrench },
  component: { label: "Componentes", icon: Cog },
  avionics: { label: "Aviónica", icon: Plane },
  directive: { label: "Directivas", icon: FileBadge },
};

const STATUS_STYLE: Record<
  MaintenanceWarningMeta["status"],
  {
    label: string;
    card: string;
    track: string;
    stroke: string;
    icon: string;
    text: string;
    badge: string;
  }
> = {
  WARNING: {
    label: "Alerta temprana",
    card: "border-amber-500/40 bg-amber-500/5",
    track: "stroke-amber-500/15",
    stroke: "stroke-amber-500",
    icon: "text-amber-600",
    text: "text-amber-700 dark:text-amber-400",
    badge: "bg-amber-500/15",
  },
  CRITICAL: {
    label: "Por vencer",
    card: "border-orange-500/40 bg-orange-500/5",
    track: "stroke-orange-500/15",
    stroke: "stroke-orange-500",
    icon: "text-orange-600",
    text: "text-orange-700 dark:text-orange-400",
    badge: "bg-orange-500/15",
  },
  OVERDUE: {
    label: "Vencido",
    card: "border-red-600/40 bg-red-600/5",
    track: "stroke-red-600/15",
    stroke: "stroke-red-600",
    icon: "text-red-600",
    text: "text-red-700 dark:text-red-400",
    badge: "bg-red-600/15",
  },
};

/**
 * Tarjeta de los vencimientos de mantenimiento, una sola para los tres
 * estados (alerta temprana, por vencer, vencido): a diferencia de
 * StockAlertCard (accionable, Sí/No) y QuarantineHazardCard (escala de
 * riesgo de varios niveles), el diseño es de "cuenta regresiva": un anillo
 * de progreso en vez de barra, sin botones porque no hay ninguna acción que
 * tomar, solo mirar el control. El estado solo cambia color y etiqueta.
 */
export function MaintenanceWarningCard({ alert }: { alert: CriticalAlert }) {
  const meta = alert.maintenanceMeta;
  if (!meta) return null;

  const style = STATUS_STYLE[meta.status];
  const isOverdue = meta.status === "OVERDUE";
  const percent = Math.round(meta.progress * 100);
  const unit = UNIT_LABEL[meta.unit] ?? meta.unit.toLowerCase();
  const control = CONTROL_META[meta.control];
  const ControlIcon = control.icon;

  // Anillo SVG: circunferencia fija, el trazo se recorta según el % consumido.
  const radius = 15;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference * (1 - meta.progress);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={cn("rounded-xl border p-3.5", style.card)}
    >
      <div className="flex items-start gap-3">
        <div className="relative mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center">
          <svg viewBox="0 0 36 36" className="h-9 w-9 -rotate-90">
            <circle
              cx="18"
              cy="18"
              r={radius}
              fill="none"
              strokeWidth="3"
              className={style.track}
            />
            <motion.circle
              cx="18"
              cy="18"
              r={radius}
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              className={style.stroke}
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: dashoffset }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>
          <Gauge className={cn("absolute h-4 w-4", style.icon)} />
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider",
                style.text,
              )}
            >
              {style.label}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-foreground">
              <ControlIcon className="h-3 w-3" />
              {control.label}
            </span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                style.badge,
                style.text,
              )}
            >
              {meta.scopeLabel}
            </span>
          </div>

          <p className="text-sm font-semibold leading-snug">{alert.title}</p>

          {alert.label && (
            <p className="text-xs font-medium leading-snug text-muted-foreground">
              {alert.label}
            </p>
          )}

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 pt-0.5 text-xs">
            <span className="text-muted-foreground">
              {isOverdue ? "Excedido" : "Remanente"}:{" "}
              <span className={cn("font-semibold", style.text)}>
                {fmtNumber(Math.abs(meta.remainingValue))} {unit}
              </span>
            </span>
            {!isOverdue && (
              <span className="text-muted-foreground">
                Estimado:{" "}
                <span className="font-semibold text-foreground">
                  {meta.estimate ?? "Sin estimación"}
                </span>
              </span>
            )}
            <span className={cn("font-bold tabular-nums", style.text)}>
              {percent}%
            </span>
          </div>

          {alert.href && (
            <Link
              href={alert.href}
              className="inline-flex items-center gap-1 pt-0.5 text-xs font-medium text-primary hover:underline"
            >
              {alert.hrefLabel ?? "Ver detalle"}
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
