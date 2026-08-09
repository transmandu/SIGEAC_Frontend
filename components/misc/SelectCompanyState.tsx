"use client";

import { cn } from "@/lib/utils";
import { Building2 } from "lucide-react";

interface SelectCompanyStateProps {
  /** Qué se vería al elegir compañía: "Las cuentas bancarias", "Las tarjetas". */
  resource: string;
  className?: string;
}

/**
 * Los recursos multi-tenant no tienen nada que mostrar sin compañía en
 * contexto. Sin contenedor propio: se apoya en el espacio de la página y
 * remite al selector de la barra superior.
 */
export function SelectCompanyState({
  resource,
  className,
}: SelectCompanyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center px-6 py-24 text-center",
        className
      )}
    >
      <div className="relative mb-7">
        {/* Halo tenue: da presencia al icono sin encerrarlo en una caja. */}
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 -z-10 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.07] blur-2xl"
        />
        <Building2
          className="h-11 w-11 text-primary/70"
          strokeWidth={1.25}
        />
      </div>

      <h2 className="text-2xl font-semibold tracking-tight">
        Seleccione una compañía
      </h2>

      <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {resource} se administran por compañía. Elija una para consultar la
        información.
      </p>

      <div
        aria-hidden
        className="my-8 h-px w-16 bg-gradient-to-r from-transparent via-border to-transparent"
      />

      <p className="text-xs uppercase tracking-widest text-muted-foreground/70">
        Selector en la barra superior
      </p>
    </div>
  );
}

export default SelectCompanyState;
