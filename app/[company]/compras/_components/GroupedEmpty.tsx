"use client";

import { AlertTriangle } from "lucide-react";

import { EmptyState } from "@/components/misc/EmptyState";

interface Props {
  /** Qué se agrupa, en plural y minúscula: "cotizaciones". */
  subject: string;
  isLoading?: boolean;
  isError?: boolean;
}

/**
 * Lo que se ve en una vista agrupada cuando no hay grupos que pintar. Sin
 * distinguir carga y error, mientras llegaban los datos (o si la consulta
 * fallaba) decía "no hay … disponibles", como si de verdad no existieran.
 */
export default function GroupedEmpty({ subject, isLoading, isError }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-6 py-10 dark:border-slate-700/60 dark:bg-slate-900/60">
      {isLoading ? (
        <p className="text-center text-sm text-muted-foreground">
          Cargando datos...
        </p>
      ) : isError ? (
        <EmptyState
          icon={AlertTriangle}
          tone="error"
          title="No se pudo cargar la información"
          description="Intente de nuevo en unos instantes."
        />
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          No hay {subject} agrupadas disponibles.
        </p>
      )}
    </div>
  );
}
