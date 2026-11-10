"use client";

import type { LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ReportSectionProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

/**
 * Sección de lectura del detalle de un reporte.
 * La cabecera es compacta para que el dato —no el contenedor— tenga el peso.
 */
export function ReportSection({
  icon: Icon,
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}: ReportSectionProps) {
  return (
    <Card className={className}>
      <CardHeader className="border-b pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              {Icon ? <Icon className="h-4 w-4 text-muted-foreground" /> : null}
              {title}
            </CardTitle>
            {description ? (
              <CardDescription>{description}</CardDescription>
            ) : null}
          </div>
          {action}
        </div>
      </CardHeader>

      <CardContent className={cn("pt-5", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
