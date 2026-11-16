import React from "react";

/**
 * Piezas comunes de las pantallas de compras. Son de compras y no las de
 * ajustes a propósito: sus pantallas llevan bandejas, agrupaciones y acciones
 * que un catálogo no tiene, y cada módulo conserva su propio mundo. Comparten
 * con el resto del sistema los tokens (tamaños, superficies, voz).
 */

export function PurchasesHeading({
  heading,
  description,
}: {
  heading: string;
  description: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 border-b pb-4">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {heading}
      </h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

/**
 * Barra de herramientas del listado (cristal gris). El contenido lo arma cada
 * pantalla: buscador y filtros a la izquierda, controles propios y contador a
 * la derecha.
 */
export function PurchasesToolbar({ children }: { children: React.ReactNode }) {
  return (
    // En móvil el buscador y los filtros ocupan todo el ancho y el contador
    // pasa debajo, a la derecha: a 360 px no caben los tres en una línea.
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200/40 bg-slate-200/40 px-3 py-2 backdrop-blur-md max-sm:flex-col max-sm:items-stretch max-sm:gap-2 max-sm:[&>span]:text-right dark:border-slate-700/60 dark:bg-slate-800/70 dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
      {children}
    </div>
  );
}
