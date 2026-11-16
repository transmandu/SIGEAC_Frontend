"use client";

import { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { PanelSection } from "@/components/forms/PanelSection";
import { cn } from "@/lib/utils";

/** Misma superficie que las tablas y listados de ajustes. */
export const profileSurface =
  "rounded-xl border border-slate-200 bg-white dark:border-slate-700/60 dark:bg-slate-900/60";

interface ProfileSectionProps {
  title: string;
  icon?: LucideIcon;
  hint?: string;
  action?: ReactNode;
  className?: string;
  /** Cuerpo sin margen: para listas con filas a borde. */
  flush?: boolean;
  children: ReactNode;
}

/** Un bloque del perfil: el panel con franja de encabezado del resto del sistema. */
export const ProfileSection = ({
  title,
  icon,
  hint,
  action,
  className,
  flush,
  children,
}: ProfileSectionProps) => (
  <PanelSection
    icon={icon}
    title={title}
    hint={hint}
    action={action}
    flush={flush}
    className={className}
  >
    {children}
  </PanelSection>
);

interface ProfileFieldProps {
  label: string;
  value?: ReactNode;
  mono?: boolean;
}

export const ProfileField = ({ label, value, mono }: ProfileFieldProps) => (
  <div className="flex items-center justify-between gap-4 py-2.5 max-sm:flex-col max-sm:items-start max-sm:gap-0.5">
    <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
    <span
      className={cn(
        "min-w-0 truncate text-sm font-medium text-slate-700 max-sm:max-w-full max-sm:whitespace-normal max-sm:wrap-anywhere dark:text-slate-200",
        mono && "font-mono",
        !value && "font-normal text-muted-foreground",
      )}
    >
      {value || "—"}
    </span>
  </div>
);
