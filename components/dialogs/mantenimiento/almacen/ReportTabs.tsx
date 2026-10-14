"use client";

import type { ReactNode } from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * Barra de pestañas de los diálogos de reportes. Las pestañas tienen ancho
 * fijo y flotan centradas en la barra: con una sola (planificación no ve el
 * balance) no se estiran a todo el ancho.
 */
export function ReportTabsList({ children }: { children: ReactNode }) {
  return (
    <TabsList className="mb-4 flex h-auto w-full items-center justify-center gap-x-2 p-1.5">
      {children}
    </TabsList>
  );
}

export function ReportTabsTrigger({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) {
  return (
    <TabsTrigger
      value={value}
      className="flex w-40 flex-none gap-2 rounded-lg text-xs transition-all duration-200 data-[state=active]:bg-background data-[state=active]:text-blue-600 data-[state=active]:shadow-md data-[state=active]:shadow-blue-500/10 data-[state=active]:ring-1"
    >
      {children}
    </TabsTrigger>
  );
}
