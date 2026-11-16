"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Mismo tratamiento de estado que los reportes de airline:
 * verde (cerrado), ámbar (en proceso/pendiente) y rojo (abierto).
 */
const STATUS_CLASSES: Record<string, string> = {
  CERRADO:
    "bg-green-100 text-green-700 border border-green-200 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800",
  ABIERTO:
    "bg-red-100 text-red-700 border border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800",
  PROCESO:
    "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
  EN_PROCESO:
    "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
  PENDIENTE:
    "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
};

const DEFAULT_CLASSES =
  "bg-red-100 text-red-700 border border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800";

type ReportStatusBadgeProps = {
  status?: string | null;
  className?: string;
};

export function ReportStatusBadge({
  status,
  className,
}: ReportStatusBadgeProps) {
  const label = status?.trim() || "PENDIENTE";
  const statusClass = STATUS_CLASSES[label.toUpperCase()] ?? DEFAULT_CLASSES;

  return (
    <Badge className={cn("text-xs font-semibold", statusClass, className)}>
      {label}
    </Badge>
  );
}
