import { cn } from "@/lib/utils";
import {
  fieldClass,
  selectTriggerClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";

/**
 * Controles de las filas de artículo de las cotizaciones. Llevan el mismo
 * acabado que el resto de formularios (`form-theme`) pero en la métrica
 * compacta de estas filas —muchos campos por artículo—: 32 px en escritorio y
 * 40 px / 16 px de texto en móvil (menos de 16 px hace que iOS acerque la
 * pantalla al enfocar).
 */
export const quoteInputClass = cn(
  fieldClass,
  "h-8 w-full rounded-md px-2.5 text-[13px] max-sm:h-10 max-sm:text-base",
);

/** Disparadores de listas (combobox, select, selector de tiempo). */
export const quoteTriggerClass = cn(
  selectTriggerClass,
  "h-8 w-full min-w-0 justify-between rounded-md px-2.5 text-[13px] font-normal max-sm:h-10 max-sm:text-base",
);
