"use client";

import { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { SectionTitle } from "@/components/forms/mantenimiento/almacen/_components/form-theme";
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
  children: ReactNode;
}

export const ProfileSection = ({
  title,
  icon,
  hint,
  action,
  className,
  children,
}: ProfileSectionProps) => (
  <section className={cn(profileSurface, "p-4 sm:p-5", className)}>
    <SectionTitle
      icon={icon}
      title={title}
      hint={hint}
      action={action}
      compact
    />
    {children}
  </section>
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
