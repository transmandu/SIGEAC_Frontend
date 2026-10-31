"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Loader2, Search } from "lucide-react";

import { fieldClass } from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface PickColumn {
  header: string;
  className?: string;
}

export interface PickRow {
  value: string;
  /** Texto en el que busca el campo de búsqueda: todo lo que el usuario ve. */
  searchable: string;
  cells: ReactNode[];
  /** Aclaración bajo la primera celda (p. ej. por qué la persona está incluida). */
  note?: string;
}

/** La casilla de Radix pinta una marca también al estar a medias: aquí lleva un guion. */
const indeterminateDashClass = cn(
  "relative data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-white",
  "data-[state=indeterminate]:[&_svg]:hidden",
  "data-[state=indeterminate]:after:absolute data-[state=indeterminate]:after:top-1/2 data-[state=indeterminate]:after:left-1/2",
  "data-[state=indeterminate]:after:h-0.5 data-[state=indeterminate]:after:w-2 data-[state=indeterminate]:after:-translate-x-1/2 data-[state=indeterminate]:after:-translate-y-1/2",
  "data-[state=indeterminate]:after:bg-white data-[state=indeterminate]:after:content-['']",
);

/**
 * Lista elegible en forma de tabla. Es una `<table>` propia y no la de
 * `ui/table`: esa envuelve en su propio contenedor con scroll y rompe el
 * encabezado fijo. Las celdas no se truncan: quien elige necesita leer el
 * nombre completo, el DNI y el departamento para no equivocarse de persona.
 */
export function PickTable({
  columns,
  rows,
  selected,
  onToggle,
  onToggleMany,
  placeholder,
  emptyMessage,
  loading,
}: {
  columns: PickColumn[];
  rows: PickRow[];
  selected: Set<string>;
  onToggle: (value: string, on: boolean) => void;
  /** Elegir o quitar de una vez todo lo que la búsqueda deja ver. */
  onToggleMany: (values: string[], on: boolean) => void;
  placeholder: string;
  emptyMessage: string;
  loading?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [onlySelected, setOnlySelected] = useState(false);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (!onlySelected || selected.has(r.value)) &&
        (!q || r.searchable.toLowerCase().includes(q)),
    );
  }, [rows, query, onlySelected, selected]);

  const shownSelected = shown.filter((r) => selected.has(r.value)).length;
  const allShown = shown.length > 0 && shownSelected === shown.length;
  const someShown = shownSelected > 0 && !allShown;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex shrink-0 items-center gap-4">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            autoComplete="off"
            className={cn(fieldClass, "h-10 pl-9 text-sm")}
          />
        </div>
        <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm text-foreground/85">
          <Checkbox
            checked={onlySelected}
            onCheckedChange={(on) => setOnlySelected(on === true)}
          />
          Solo elegidos ({selected.size})
        </label>
      </div>

      <div className="min-h-64 flex-1 overflow-y-auto rounded-lg border border-slate-400/60 dark:border-slate-600/60">
        {loading ? (
          <Loader2 className="mx-auto my-12 size-5 animate-spin text-muted-foreground" />
        ) : shown.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        ) : (
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead className="sticky top-0 z-10 bg-muted text-left text-xs text-muted-foreground">
              <tr>
                <th className="w-11 border-b px-3 py-2">
                  <Checkbox
                    checked={
                      allShown ? true : someShown ? "indeterminate" : false
                    }
                    onCheckedChange={(on) =>
                      onToggleMany(
                        shown.map((r) => r.value),
                        on === true,
                      )
                    }
                    className={indeterminateDashClass}
                    aria-label="Elegir todos los que se ven"
                  />
                </th>
                {columns.map((c) => (
                  <th
                    key={c.header}
                    className={cn(
                      "border-b px-3 py-2 font-medium",
                      c.className,
                    )}
                  >
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => {
                const checked = selected.has(r.value);
                return (
                  <tr
                    key={r.value}
                    onClick={() => onToggle(r.value, !checked)}
                    className={cn(
                      "cursor-pointer transition-colors",
                      checked ? "bg-primary/6" : "hover:bg-primary/3",
                    )}
                  >
                    {/* La casilla se alterna sola. Dentro de un formulario Radix
                        además dispara un clic en su input oculto que sube hasta
                        la fila y la alternaba otra vez, anulando el cambio: por
                        eso esta celda corta la propagación y solo alterna ella
                        misma si el clic cae en su margen, no en la casilla. */}
                    <td
                      className="border-b border-border/60 px-3 py-2.5 align-top"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (e.target === e.currentTarget) {
                          onToggle(r.value, !checked);
                        }
                      }}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(on) => onToggle(r.value, on === true)}
                        className="mt-0.5 h-4.5 w-4.5"
                        aria-label="Elegir"
                      />
                    </td>
                    {r.cells.map((cell, i) => (
                      <td
                        key={i}
                        className={cn(
                          "border-b border-border/60 px-3 py-2.5 align-top",
                          columns[i]?.className,
                        )}
                      >
                        {cell}
                        {i === 0 && r.note && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {r.note}
                          </p>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
