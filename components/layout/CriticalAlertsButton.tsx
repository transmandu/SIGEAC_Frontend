"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { AlertTriangle, Biohazard, Eye, EyeOff, Truck } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { useCriticalAlerts } from "@/hooks/alerts/useCriticalAlerts";
import { useDismissedAlertsStore } from "@/hooks/alerts/useDismissedAlertsStore";
import { useAlertFiltersStore } from "@/hooks/alerts/useAlertFiltersStore";
import { CriticalAlert } from "@/hooks/alerts/types";
import { CriticalAlertCard } from "./CriticalAlertCard";

/**
 * Cómo se nombra lo pendiente según qué alertas tiene este usuario. Los roles
 * de almacén y los de compras casi no se solapan, así que el panel adopta el
 * vocabulario de lo que hay delante en vez de asumir siempre el de stock.
 */
const TONE_COPY = {
  restock: {
    summary: (n: number) => `${n} artículo${n === 1 ? "" : "s"} sin reponer`,
    /** Forma corta para cuando varios tonos comparten el resumen. */
    short: (n: number) => `${n} sin reponer`,
    empty: "Todo lo bajo de mínimo ya está comprado",
  },
  hazard: {
    summary: (n: number) => `${n} artículo${n === 1 ? "" : "s"} retenido${n === 1 ? "" : "s"} en cuarentena`,
    short: (n: number) => `${n} en cuarentena`,
    empty: "Sin artículos retenidos",
  },
  mixed: {
    summary: (n: number) => `${n} alerta${n === 1 ? "" : "s"} pendiente${n === 1 ? "" : "s"}`,
    short: (n: number) => `${n} pendiente${n === 1 ? "" : "s"}`,
    empty: "Nada pendiente",
  },
} as const;

export default function CriticalAlertsButton() {
  const {
    alerts,
    count,
    isCountActionable,
    actionableCount,
    inTransitCount,
    tone,
    toneCounts,
  } = useCriticalAlerts();

  const isHazardTone = tone === "hazard";
  const copy = TONE_COPY[tone];

  // Con varias clases a la vista el resumen las separa; si no, basta el tono.
  // Se arma recorriendo lo que llegó, así un tono nuevo aparece sin tocar esto.
  const summary = tone === "mixed"
    ? Object.entries(toneCounts)
        .filter(([, n]) => (n ?? 0) > 0)
        .map(([key, n]) => TONE_COPY[key as keyof typeof TONE_COPY].short(n ?? 0))
        .join(" · ")
    : copy.summary(actionableCount);
  const dismiss = useDismissedAlertsStore((state) => state.dismiss);
  const hideInTransit = useAlertFiltersStore((state) => state.hideInTransit);
  const toggleInTransit = useAlertFiltersStore((state) => state.toggleInTransit);
  const hasAlerts = count > 0;
  const [open, setOpen] = useState(false);
  const [rollOffset, setRollOffset] = useState({ x: 0, y: 0 });

  const anchorRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Rodadura real: la rotación se deriva de la distancia recorrida
  // (una vuelta por circunferencia, h-14 = 56px de diámetro), así el botón
  // rueda sin patinar al ir y se desenrolla en reversa al volver.
  // Se redondea a vueltas completas para que el icono llegue derecho y no
  // quede inclinado a medio giro; el leve patinaje extra es imperceptible.
  const BUTTON_DIAMETER = 56;
  const ROLL_DURATION_S = 0.65;
  const rawRotation = (rollOffset.x / (Math.PI * BUTTON_DIAMETER)) * 360;
  const fullTurns = Math.round(rawRotation / 360) || Math.sign(rawRotation);
  const rollRotation = rollOffset.x === 0 ? 0 : fullTurns * 360;

  useLayoutEffect(() => {
    if (!open) {
      setRollOffset({ x: 0, y: 0 });
      return;
    }

    const measure = () => {
      const anchor = anchorRef.current;
      const panel = panelRef.current;
      if (!anchor || !panel) return;

      // Se mide contra el ancla fija (posición base del botón), no contra el
      // botón: su rect ya incluye el translate de la animación y daría offset 0.
      const anchorRect = anchor.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();

      const anchorCenterX = anchorRect.left + anchorRect.width / 2;
      const panelCenterX = panelRect.left + panelRect.width / 2;

      setRollOffset({
        x: panelCenterX - anchorCenterX,
        y: 0,
      });
    };

    // Deja que Radix posicione el panel antes de medir.
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [open, alerts.length]);

  const handleDismiss = (alert: CriticalAlert) => {
    dismiss(alert.id);
  };

  const handleConfirm = (alert: CriticalAlert) => {
    alert.onConfirm?.();
  };

  if (!hasAlerts) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* Ancla invisible y estática: Radix posiciona el popover contra esto,
          no contra el botón, que se mueve libremente con su propia animación. */}
      <PopoverAnchor asChild>
        <div ref={anchorRef} className="fixed bottom-6 right-6 h-14 w-14" />
      </PopoverAnchor>

      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100} open={open ? false : undefined}>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <motion.button
                animate={{
                  scale: open ? 1.1 : 1,
                  opacity: 1,
                  x: rollOffset.x,
                  y: rollOffset.y,
                  rotate: rollRotation,
                }}
                transition={{
                  // x y rotate comparten timing y ease: si se desincronizan,
                  // la rodadura se ve como deslizamiento con giro.
                  x: { duration: ROLL_DURATION_S, ease: "easeInOut" },
                  y: { duration: ROLL_DURATION_S, ease: "easeInOut" },
                  rotate: { duration: ROLL_DURATION_S, ease: "easeInOut" },
                  scale: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
                }}
                whileHover={open ? undefined : { scale: 1.06, y: -2 }}
                whileTap={open ? undefined : { scale: 0.94 }}
                aria-label={
                  isCountActionable
                    ? `Alertas críticas: ${summary}`
                    : `Alertas: ${inTransitCount} en camino, nada pendiente de pedir`
                }
                className={cn(
                  "flex items-center justify-center",
                  "fixed bottom-6 right-6 z-[1003]",
                  "h-14 w-14 rounded-full",
                  "backdrop-blur-md",
                  "shadow-[0_8px_30px_rgba(0,0,0,0.18)]",
                  "ring-1 transition-colors duration-300",
                  // Sin nada accionable el botón deja de gritar: todo lo bajo
                  // de stock ya está comprado y solo falta que llegue.
                  !isCountActionable
                    ? "bg-gradient-to-br from-sky-500 to-blue-600 text-white ring-sky-400/40 hover:from-sky-500 hover:to-blue-500"
                    : isHazardTone
                      ? "bg-gradient-to-br from-red-600 to-red-800 text-white ring-red-500/50 hover:from-red-600 hover:to-red-700"
                      : "bg-gradient-to-br from-red-500 to-rose-600 text-white ring-red-400/40 hover:from-red-500 hover:to-rose-500"
                )}
              >
                {/* El latido solo acompaña a lo que exige acción. */}
                {!open && isCountActionable && (
                  <motion.span
                    className={cn(
                      "absolute inset-0 rounded-full",
                      isHazardTone ? "bg-red-700/50" : "bg-red-500/50"
                    )}
                    animate={{ scale: [1, 1.35, 1], opacity: [0.55, 0, 0.55] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}

                {!isCountActionable
                  ? <Truck className="relative h-6 w-6 drop-shadow-sm" />
                  : isHazardTone
                    ? <Biohazard className="relative h-6 w-6 drop-shadow-sm" />
                    : <AlertTriangle className="relative h-6 w-6 drop-shadow-sm" />}

                <motion.span
                  key={count}
                  initial={{ scale: 0.5, opacity: 0, y: 4 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className={cn(
                    "absolute -top-1 -right-1",
                    "min-w-5 h-5 px-1",
                    "flex items-center justify-center",
                    "rounded-full",
                    "bg-white",
                    !isCountActionable
                      ? "text-sky-600 ring-sky-500/30"
                      : isHazardTone
                        ? "text-red-700 ring-red-600/40"
                        : "text-red-600 ring-red-500/30",
                    "text-[11px] font-bold",
                    "shadow-sm ring-2"
                  )}
                >
                  {count > 99 ? "99+" : count}
                </motion.span>
              </motion.button>
            </PopoverTrigger>
          </TooltipTrigger>

          <TooltipContent side="left" className="z-[1002]">
            {isCountActionable
              ? `${summary}${inTransitCount > 0 ? ` · ${inTransitCount} en camino` : ""}`
              : `${inTransitCount} artículo${inTransitCount === 1 ? "" : "s"} bajo mínimo, ya en camino`}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <PopoverContent
        ref={panelRef}
        forceMount
        side="top"
        align="end"
        sideOffset={16}
        onFocusOutside={(event) => {
          if (panelRef.current?.contains(event.target as Node)) {
            event.preventDefault();
          }
        }}
        onInteractOutside={(event) => {
          if (panelRef.current?.contains(event.target as Node)) {
            event.preventDefault();
          }
        }}
        className={cn(
          "z-[1002] flex max-h-[70vh] w-96 max-w-[calc(100vw-3rem)] animate-none flex-col overflow-hidden rounded-2xl border-none p-0 shadow-2xl data-[state=closed]:animate-none data-[state=open]:animate-none",
          !open && "pointer-events-none"
        )}
        style={{
          opacity: open ? 1 : 0,
          transform: `scale(${open ? 1 : 0.92})`,
          // Al abrir, el panel espera a que el botón termine de rodar y
          // "se enciende" justo cuando llega; al cerrar se apaga de inmediato
          // mientras la bola rueda de vuelta.
          transition: `opacity 0.3s cubic-bezier(0.22,1,0.36,1) ${open ? `${ROLL_DURATION_S - 0.1}s` : "0s"}, transform 0.3s cubic-bezier(0.22,1,0.36,1) ${open ? `${ROLL_DURATION_S - 0.1}s` : "0s"}`,
        }}
      >
        <div
          className={cn(
            "shrink-0 border-b px-4 py-3",
            !isCountActionable
              ? "bg-gradient-to-r from-sky-500/10 to-blue-500/10"
              : isHazardTone
                ? "bg-gradient-to-r from-red-600/15 to-red-800/10"
                : "bg-gradient-to-r from-red-500/10 to-rose-500/10"
          )}
        >
          <p className="text-sm font-semibold">Alertas críticas</p>
          <p className="text-xs text-muted-foreground">
            {actionableCount > 0
              ? `${summary}${inTransitCount > 0 ? ` · ${inTransitCount} en camino` : ""}`
              : copy.empty}
          </p>

          {/* Solo tiene sentido cuando hay algo que ocultar; si no, es un
              control muerto. */}
          {inTransitCount > 0 && (
            <button
              type="button"
              onClick={toggleInTransit}
              className={cn(
                "mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
                "text-[11px] font-medium transition-colors",
                hideInTransit
                  ? "border-sky-500/40 bg-sky-500/10 text-sky-700 hover:bg-sky-500/15"
                  : "border-border bg-background/60 text-muted-foreground hover:bg-muted"
              )}
            >
              {hideInTransit ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {hideInTransit
                ? `Mostrar ${inTransitCount} en camino`
                : `Ocultar ${inTransitCount} en camino`}
            </button>
          )}
        </div>

        {/* ScrollArea de Radix necesita una altura definida (su viewport usa h-full);
            con max-h + flex la altura es indefinida y nunca desborda. Scroll nativo. */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="flex flex-col gap-2 p-3">
            {/* Con el filtro activo y solo alertas en camino la lista queda
                vacía: sin esto el panel se abriría en blanco, como si fallara. */}
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center gap-1 px-4 py-8 text-center">
                <Truck className="h-6 w-6 text-sky-600" />
                <p className="text-sm font-medium">Nada pendiente de pedir</p>
                <p className="text-xs text-muted-foreground">
                  {inTransitCount} artículo{inTransitCount === 1 ? "" : "s"} bajo mínimo
                  {inTransitCount === 1 ? " está" : " están"} en camino.
                </p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {alerts.map((alert) => (
                  <CriticalAlertCard
                    key={alert.id}
                    alert={alert}
                    onConfirm={handleConfirm}
                    onDismiss={handleDismiss}
                    isConfirming={alert.isConfirming}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
