"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
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
import { CriticalAlert } from "@/hooks/alerts/types";
import { CriticalAlertCard } from "./CriticalAlertCard";

export default function CriticalAlertsButton() {
  const { alerts, count } = useCriticalAlerts();
  const dismiss = useDismissedAlertsStore((state) => state.dismiss);
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
                aria-label="Alertas críticas"
                className={cn(
                  "flex items-center justify-center",
                  "fixed bottom-6 right-6 z-[1003]",
                  "h-14 w-14 rounded-full",
                  "backdrop-blur-md",
                  "shadow-[0_8px_30px_rgba(0,0,0,0.18)]",
                  "ring-1 transition-colors duration-300",
                  "bg-gradient-to-br from-red-500 to-rose-600 text-white ring-red-400/40 hover:from-red-500 hover:to-rose-500"
                )}
              >
                {!open && (
                  <motion.span
                    className="absolute inset-0 rounded-full bg-red-500/50"
                    animate={{ scale: [1, 1.35, 1], opacity: [0.55, 0, 0.55] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}

                <AlertTriangle className="relative h-6 w-6 drop-shadow-sm" />

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
                    "bg-white text-red-600",
                    "text-[11px] font-bold",
                    "shadow-sm ring-2 ring-red-500/30"
                  )}
                >
                  {count > 99 ? "99+" : count}
                </motion.span>
              </motion.button>
            </PopoverTrigger>
          </TooltipTrigger>

          <TooltipContent side="left" className="z-[1002]">
            {`${count} situación${count === 1 ? "" : "es"} crítica${count === 1 ? "" : "s"} requieren atención`}
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
        <div className="shrink-0 border-b bg-gradient-to-r from-red-500/10 to-rose-500/10 px-4 py-3">
          <p className="text-sm font-semibold">Alertas críticas</p>
          <p className="text-xs text-muted-foreground">
            Situaciones que requieren tu atención
          </p>
        </div>

        {/* ScrollArea de Radix necesita una altura definida (su viewport usa h-full);
            con max-h + flex la altura es indefinida y nunca desborda. Scroll nativo. */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="flex flex-col gap-2 p-3">
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
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
