"use client";

import Link from "next/link";
import { ArrowUpRight, Gauge } from "lucide-react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";
import { CriticalAlert } from "@/hooks/alerts/types";
import { fmtNumber } from "@/lib/maintenanceControlCalc";

const UNIT_LABEL: Record<string, string> = { HOURS: "horas", CYCLES: "ciclos", DAYS: "días" };
const CATEGORY_LABEL: Record<string, string> = { CERTIFICATE: "Certificado", SERVICE: "Servicio" };

/**
 * Tarjeta propia de "alerta temprana" de mantenimiento: a diferencia de
 * StockAlertCard (accionable, Sí/No) y QuarantineHazardCard (escala de
 * riesgo de varios niveles), acá hay un solo nivel —WARNING es un umbral
 * único, no una gradación— así que el diseño es de "cuenta regresiva": un
 * anillo de progreso en vez de barra, sin botones porque no hay ninguna
 * acción que tomar todavía, solo mirar el control con tiempo.
 */
export function MaintenanceWarningCard({ alert }: { alert: CriticalAlert }) {
  const meta = alert.maintenanceMeta;
  if (!meta) return null;

  const percent = Math.round(meta.progress * 100);
  const unit = UNIT_LABEL[meta.unit] ?? meta.unit.toLowerCase();
  const scopeLabel = meta.scope === "part" && meta.partLabel
    ? `${CATEGORY_LABEL[meta.category]} de parte`
    : meta.scope === "part"
      ? "Servicio de parte"
      : meta.category === "CERTIFICATE"
        ? "Certificado de aeronave"
        : "Servicio de aeronave";

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
      className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-3.5"
    >
      <div className="flex items-start gap-3">
        <div className="relative mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center">
          <svg viewBox="0 0 36 36" className="h-9 w-9 -rotate-90">
            <circle cx="18" cy="18" r={radius} fill="none" strokeWidth="3" className="stroke-amber-500/15" />
            <motion.circle
              cx="18"
              cy="18"
              r={radius}
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              className="stroke-amber-500"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: dashoffset }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>
          <Gauge className="absolute h-4 w-4 text-amber-600" />
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-500">
              Alerta temprana
            </span>
            <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
              {scopeLabel}
            </span>
          </div>

          <p className="text-sm font-semibold leading-snug">{alert.title}</p>

          {alert.label && (
            <p className="text-xs font-medium leading-snug text-muted-foreground">{alert.label}</p>
          )}

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 pt-0.5 text-xs">
            <span className="text-muted-foreground">
              Objetivo: <span className="font-semibold text-foreground">{fmtNumber(meta.limitValue)} {unit}</span>
            </span>
            <span className="text-muted-foreground">
              Restante: <span className="font-semibold text-amber-700 dark:text-amber-400">{fmtNumber(meta.remainingValue)} {unit}</span>
            </span>
            <span className={cn("font-bold tabular-nums text-amber-700 dark:text-amber-400")}>
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
