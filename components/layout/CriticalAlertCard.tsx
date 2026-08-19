"use client";

import { useRef } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowUpRight, Check, Loader2, Truck, X } from "lucide-react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";
import { disintegrate } from "@/lib/disintegrate";
import { Button } from "@/components/ui/button";
import { CriticalAlert, alertVariant, isAlertDismissable } from "@/hooks/alerts/types";
import { QuarantineHazardCard } from "./QuarantineHazardCard";

/**
 * Despacha cada alerta a la tarjeta de su variante. No conoce el diseño de
 * ninguna: una fuente con presentación propia agrega su variante y su
 * componente, sin tocar el resto.
 */
export function CriticalAlertCard({
  alert,
  onConfirm,
  onDismiss,
  isConfirming,
}: {
  alert: CriticalAlert;
  onConfirm: (alert: CriticalAlert) => void;
  onDismiss: (alert: CriticalAlert) => void;
  isConfirming?: boolean;
}) {
  if (alertVariant(alert) === "quarantine-hazard") {
    return <QuarantineHazardCard alert={alert} />;
  }

  return <StockAlertCard alert={alert} onConfirm={onConfirm} onDismiss={onDismiss} isConfirming={isConfirming} />;
}

function StockAlertCard({
  alert,
  onConfirm,
  onDismiss,
  isConfirming,
}: {
  alert: CriticalAlert;
  onConfirm: (alert: CriticalAlert) => void;
  onDismiss: (alert: CriticalAlert) => void;
  isConfirming?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const isInTransit = alert.severity === "in-transit";
  const canConfirm = !!alert.onConfirm;
  const canDismiss = isAlertDismissable(alert);

  const handleDismiss = () => {
    const card = cardRef.current;
    if (!card) {
      onDismiss(alert);
      return;
    }
    // Las cenizas animan clones fijos sobre el body; el original se oculta
    // en el mismo tick para que no se vea duplicado. Sigue ocupando su
    // espacio (visibility, no display) y el dismiss real espera al final de
    // la animación: así el popover no se reacomoda mientras vuela el polvo.
    const done = disintegrate(card);
    card.style.visibility = "hidden";
    void done.then(() => onDismiss(alert));
  };

  return (
    <motion.div
      ref={cardRef}
      layout
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, scale: 0.96 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "rounded-xl border p-3.5",
        "bg-gradient-to-br from-background to-muted/40",
        "shadow-sm"
      )}
    >
      <div className="flex items-start gap-2.5">
        <span
          className={cn(
            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
            isInTransit
              ? "bg-sky-500/15 text-sky-600"
              : alert.severity === "critical"
                ? "bg-red-500/15 text-red-600"
                : "bg-amber-500/15 text-amber-600"
          )}
        >
          {/* En tránsito la reposición ya está pedida: el camión comunica
              "viene en camino", no el peligro del triángulo. */}
          {isInTransit ? <Truck className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
        </span>

        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="text-sm font-semibold leading-snug">{alert.title}</p>
          {alert.label && (
            <p className="text-xs font-semibold leading-snug text-foreground">
              {alert.label}
            </p>
          )}
          {alert.description && (
            <p className="text-xs text-muted-foreground leading-snug whitespace-pre-line">
              {alert.description}
            </p>
          )}
          {alert.href && (
            <Link
              href={alert.href}
              className="inline-flex items-center gap-1 text-xs font-medium text-sky-600 hover:underline"
            >
              {alert.hrefLabel ?? "Ver detalle"}
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>

      {/* Sin ninguna acción disponible no se dibuja la barra: dejarla vacía o
          con botones muertos es peor que no tenerla. */}
      {(canConfirm || canDismiss) && (
        <div className="mt-3 flex items-center justify-end gap-2">
          {canDismiss && (
            <Button
              type="button"
              size="sm"
              disabled={isConfirming}
              onClick={handleDismiss}
              className="h-7 gap-1 bg-red-600 px-2.5 text-xs text-white hover:bg-red-700"
            >
              <X className="h-3.5 w-3.5" />
              {isInTransit ? "Entendido" : "No"}
            </Button>
          )}
          {canConfirm && (
            <Button
              type="button"
              size="sm"
              disabled={isConfirming}
              onClick={() => onConfirm(alert)}
              className="h-7 gap-1 bg-green-600 px-2.5 text-xs text-white hover:bg-green-700"
            >
              {isConfirming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              {/* En tránsito no se confirma una compra evidente: se insiste sobre
                  algo ya pedido, y la etiqueta debe decirlo. */}
              {isInTransit ? "Pedir igual" : "Sí"}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}
