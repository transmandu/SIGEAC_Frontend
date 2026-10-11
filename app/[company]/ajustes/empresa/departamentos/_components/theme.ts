/**
 * Clases de esta pantalla que salen de los patrones ya usados en /compras:
 * la barra de herramientas con cristal gris y las pestañas con anillo azul.
 * Los campos y secciones de formulario vienen de `form-theme` del almacén.
 */

export const toolbarBarClass =
  "flex items-center gap-2 rounded-xl border px-3 py-2 bg-slate-200/40 border-slate-200/40 dark:bg-slate-800/70 dark:border-slate-700/60 backdrop-blur-md";

export const toolbarFieldClass =
  "h-8 text-xs bg-white/80 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-700/60 focus-visible:ring-1 focus-visible:ring-primary/40";

export const toolbarIconButtonClass =
  "h-8 w-8 shrink-0 bg-white/80 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-700/60";

export const tabTriggerClass =
  "flex items-center justify-center gap-2 rounded-lg text-xs sm:text-sm transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:shadow-primary/10 data-[state=active]:ring-1 data-[state=active]:ring-primary/20 data-[state=active]:text-primary";

/** Fila seleccionable de una lista: el azul aparece solo al apuntarla. */
export const listRowClass =
  "rounded-lg border border-slate-400/40 dark:border-slate-600/40 bg-linear-to-br from-background/70 to-background/40 transition-all duration-200 hover:border-blue-400/40 hover:shadow-md hover:shadow-blue-500/10";
