"use client";

import Link from "next/link";
import { ArrowUpRight, Biohazard } from "lucide-react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";
import { CriticalAlert, QuarantineHazardMeta } from "@/hooks/alerts/types";

/**
 * Un tramo por cada 20% del plazo legal consumido. La escala sube de ámbar a
 * rojo sin pasar por verde: ningún artículo retenido está "bien", solo más o
 * menos cerca del vencimiento.
 */
const TIER_STYLES = [
    {
        card: "border-amber-500/30 bg-amber-500/[0.04]",
        badge: "bg-amber-500/15 text-amber-600",
        bar: "bg-amber-500",
        title: "text-amber-700 dark:text-amber-500",
    },
    {
        card: "border-amber-500/50 bg-amber-500/[0.07]",
        badge: "bg-amber-500/20 text-amber-700",
        bar: "bg-amber-500",
        title: "text-amber-700 dark:text-amber-500",
    },
    {
        card: "border-orange-500/60 bg-orange-500/[0.09]",
        badge: "bg-orange-500/20 text-orange-700",
        bar: "bg-orange-500",
        title: "text-orange-700 dark:text-orange-500",
    },
    {
        card: "border-red-500/60 bg-red-500/[0.09]",
        badge: "bg-red-500/20 text-red-700",
        bar: "bg-red-500",
        title: "text-red-700 dark:text-red-500",
    },
    {
        card: "border-red-600/80 bg-red-600/[0.12] shadow-[0_0_0_1px_rgba(220,38,38,0.15)]",
        badge: "bg-red-600/25 text-red-700",
        bar: "bg-red-600",
        title: "text-red-700 dark:text-red-400",
    },
    {
        card: "border-red-700 bg-red-700/[0.16] shadow-[0_0_18px_-4px_rgba(185,28,28,0.55)]",
        badge: "bg-red-700/30 text-red-800 dark:text-red-300",
        bar: "bg-red-700",
        title: "text-red-800 dark:text-red-300",
    },
] as const;

/**
 * Franjas de peligro tipo cinta de precinto, reservadas al vencido: es el único
 * estado que ya no anticipa nada, sino que reporta un incumplimiento en curso.
 */
const HAZARD_STRIPES =
    "repeating-linear-gradient(45deg, rgba(185,28,28,0.85) 0 10px, rgba(24,24,27,0.85) 10px 20px)";

const timeLabel = ({ daysElapsed, legalDays, remaining, isExpired }: QuarantineHazardMeta) => {
    if (remaining === null) return `${daysElapsed} día${daysElapsed === 1 ? "" : "s"} retenido`;

    const base = `${daysElapsed} de ${legalDays} días`;

    if (isExpired) {
        const over = Math.abs(remaining);
        return `${base} · vencido por ${over} día${over === 1 ? "" : "s"}`;
    }

    return `${base} · restan ${remaining}`;
};

export function QuarantineHazardCard({ alert }: { alert: CriticalAlert }) {
    const hazard = alert.hazard;

    if (!hazard) return null;

    const tier = TIER_STYLES[hazard.tier];
    const percent = Math.round(hazard.progress * 100);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={cn("overflow-hidden rounded-xl border", tier.card)}
        >
            {hazard.isExpired && (
                <div className="h-1.5 w-full" style={{ backgroundImage: HAZARD_STRIPES }} />
            )}

            <div className="p-3.5">
                <div className="flex items-start gap-2.5">
                    <span
                        className={cn(
                            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                            tier.badge,
                        )}
                    >
                        <Biohazard className="h-4 w-4" />
                    </span>

                    <div className="min-w-0 flex-1 space-y-1.5">
                        <p
                            className={cn(
                                "text-[11px] font-bold uppercase tracking-wider",
                                tier.title,
                            )}
                        >
                            {alert.title}
                        </p>

                        {alert.label && (
                            <p className="text-xs font-semibold leading-snug text-foreground">
                                {alert.label}
                            </p>
                        )}

                        <div className="space-y-1 pt-0.5">
                            <div className="flex items-baseline justify-between gap-2">
                                <span className="text-[11px] font-medium text-foreground/80">
                                    {timeLabel(hazard)}
                                </span>
                                <span className={cn("text-[11px] font-bold tabular-nums", tier.title)}>
                                    {percent}%
                                </span>
                            </div>

                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.max(percent, 2)}%` }}
                                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                    className={cn("h-full rounded-full", tier.bar)}
                                />
                            </div>
                        </div>

                        {alert.description && (
                            <p className="whitespace-pre-line text-xs leading-snug text-muted-foreground">
                                {alert.description}
                            </p>
                        )}

                        {alert.href && (
                            <Link
                                href={alert.href}
                                className={cn(
                                    "inline-flex items-center gap-1 pt-0.5 text-xs font-semibold hover:underline",
                                    tier.title,
                                )}
                            >
                                {alert.hrefLabel ?? "Ver detalle"}
                                <ArrowUpRight className="h-3 w-3" />
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
