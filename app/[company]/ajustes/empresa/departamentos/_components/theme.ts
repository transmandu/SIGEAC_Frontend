/**
 * Clases del organigrama que no tienen componente propio: la barra de
 * búsqueda del árbol (el cristal gris de las barras de herramientas) y la
 * fila seleccionable de una lista.
 */

export const toolbarBarClass =
  "flex items-center gap-2 rounded-xl border px-3 py-2 max-sm:p-2 bg-slate-200/40 border-slate-200/40 dark:bg-slate-800/70 dark:border-slate-700/60 backdrop-blur-md";

export const toolbarFieldClass =
  "h-8 text-xs max-sm:h-10 max-sm:text-base bg-white/80 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-700/60 focus-visible:ring-1 focus-visible:ring-primary/40";

export const toolbarIconButtonClass =
  "size-8 shrink-0 max-sm:size-10 bg-white/80 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-700/60";

/** Fila seleccionable de una lista: el azul aparece solo al apuntarla. */
export const listRowClass =
  "rounded-lg border border-slate-400/40 dark:border-slate-600/40 bg-linear-to-br from-background/70 to-background/40 transition-all duration-200 hover:border-blue-400/40 hover:shadow-md hover:shadow-blue-500/10";
