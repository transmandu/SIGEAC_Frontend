"use client";

import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ProfileSectionProps {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

export const ProfileSection = ({
  title,
  icon,
  action,
  className,
  children,
}: ProfileSectionProps) => (
  <section className={cn("space-y-3", className)}>
    <div className="flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}
        {title}
      </h2>
      {action}
    </div>

    {children}
  </section>
);

interface ProfileFieldProps {
  label: string;
  value?: ReactNode;
  mono?: boolean;
}

export const ProfileField = ({ label, value, mono }: ProfileFieldProps) => (
  <div className="flex items-center justify-between gap-4 py-2.5">
    <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
    <span
      className={cn(
        "min-w-0 truncate text-sm font-medium",
        mono && "font-mono",
        !value && "font-normal text-muted-foreground"
      )}
    >
      {value || "—"}
    </span>
  </div>
);
