"use client";

import * as React from "react";
import { CommandGroup } from "@/components/ui/command";

/**
 * Agrupa por lote, con encabezado siempre visible.
 *
 * El encabezado (nombre del renglón) también se muestra mientras se busca:
 * sin él, buscar por número de parte devuelve resultados de varios renglones
 * distintos sin forma de saber a cuál pertenece cada uno.
 */
export function SearchAwareGroup({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return <CommandGroup heading={heading}>{children}</CommandGroup>;
}
