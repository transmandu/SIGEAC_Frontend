import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CursorPaginationProps {
  pageIndex: number;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  /**
   * La página pedida todavía no ha llegado y en pantalla siguen las filas de
   * la anterior. El clic ocurre aquí, así que aquí tiene que verse que algo
   * pasó: sin esta señal el usuario ve los mismos datos durante ~1s y cree que
   * el botón no hizo nada.
   */
  isTransitioning?: boolean;
}

/**
 * Mismo lenguaje visual que DataTablePagination, adaptado a cursor: sin
 * conteo total de páginas ni salto a primera/última, porque un cursor solo
 * sabe moverse un paso adelante o atrás desde donde está.
 */
export function CursorPagination({
  pageIndex,
  pageSize,
  onPageSizeChange,
  onPrevPage,
  onNextPage,
  hasPrevPage,
  hasNextPage,
  isTransitioning = false,
}: CursorPaginationProps) {
  return (
    <div
      className="
        flex flex-col md:flex-row items-center justify-between px-3 py-2 gap-2
        border-t border-slate-200/50 dark:border-slate-700/40
        bg-transparent
      "
    >
      <div className="flex-1 text-sm text-muted-foreground" />

      <div className="flex items-center space-x-6 lg:space-x-8">
        {/* PAGE SIZE */}
        <div className="flex items-center space-x-2">
          <p className="text-xs font-medium text-muted-foreground">
            Items por página:
          </p>

          <Select
            value={`${pageSize}`}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger
              className="
                h-8 w-17.5 text-xs
                bg-white dark:bg-slate-900/60
                border border-slate-200/60 dark:border-slate-700/50
                shadow-[0_1px_2px_rgba(0,0,0,0.04)]
                hover:shadow-[0_2px_6px_rgba(0,0,0,0.06)]
                transition-all
              "
            >
              <SelectValue />
            </SelectTrigger>

            <SelectContent side="top">
              {[15, 25, 50, 100].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* PAGE INFO: sin total, cursor pagination no lo tiene sin paginar
            todo el histórico solo para contarlo. */}
        <div className="flex w-25 items-center justify-center text-xs font-medium">
          <span className="text-muted-foreground">Página</span>

          <span className="mx-1 text-foreground font-semibold tabular-nums">
            {pageIndex + 1}
          </span>

          {/* El número ya cambió (sale del cursor local, no de la respuesta),
              así que el spinner es lo que distingue "página 2 cargando" de
              "página 2 lista". */}
          {isTransitioning && (
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* NAV */}
        <div className="flex items-center space-x-2">
          {[
            {
              icon: ChevronLeft,
              action: onPrevPage,
              disabled: !hasPrevPage,
              label: "Anterior",
            },
            {
              icon: ChevronRight,
              action: onNextPage,
              disabled: !hasNextPage,
              label: "Siguiente",
            },
          ].map(({ icon: Icon, action, disabled, label }) => (
            <Button
              key={label}
              variant="ghost"
              className="
                h-8 w-8 p-0 rounded-md
                text-muted-foreground
                hover:text-foreground
                hover:bg-white dark:hover:bg-slate-800/50
                border border-transparent hover:border-slate-200/40 dark:hover:border-slate-700/40
                shadow-none hover:shadow-xs
                transition-all
              "
              onClick={action}
              disabled={disabled}
            >
              <span className="sr-only">{label}</span>
              <Icon className="h-4 w-4" />
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
