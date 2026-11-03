"use client";

import React from "react";
import { Search } from "lucide-react";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SettingsListPageProps {
  /** Título de la pestaña/ContentLayout. */
  title: string;
  heading: string;
  description: React.ReactNode;
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
  };
  /** Filtros extra (selects) junto al buscador. */
  filters?: React.ReactNode;
  /** Barra propia (buscador + filtros) cuando `search`/`filters` no alcanzan. */
  toolbar?: React.ReactNode;
  /** `value` indefinido mientras carga o si falló: no se muestra un "0" falso. */
  count?: { value?: number; singular: string; plural: string };
  /** Prefijo del `data-tour` del encabezado (`-title`). */
  tourPrefix?: string;
  /** `data-tour` de la barra de búsqueda y filtros, si algún tour la señala. */
  toolbarTourId?: string;
  /** Botones de acción (solo icono) a la derecha de la barra, junto al contador. */
  toolbarActions?: React.ReactNode;
  /**
   * El contenido llena la altura de la pantalla en escritorio, para que sea él
   * quien desplace y no la página (bandejas largas). Quien lo use da a su
   * contenedor `md:flex-1 md:min-h-0`. En móvil la página desplaza con normalidad.
   */
  fill?: boolean;
  children: React.ReactNode;
}

/**
 * Armazón de los listados de ajustes. No depende de ningún dato: se pinta de
 * inmediato y la carga/error de la tabla ocurre dentro de ella.
 */
export function SettingsListPage({
  title,
  heading,
  description,
  search,
  filters,
  toolbar,
  count,
  tourPrefix,
  toolbarTourId,
  toolbarActions,
  fill = false,
  children,
}: SettingsListPageProps) {
  const hasToolbar =
    !!search || !!filters || !!toolbar || !!count || !!toolbarActions;

  return (
    <ContentLayout title={title}>
      <div
        className={cn(
          "flex flex-col gap-6",
          fill && "md:h-[calc(100dvh-8rem)]",
        )}
      >
        <PageHeader />

        <div
          className="flex shrink-0 flex-col gap-2 border-b pb-4"
          data-tour={tourPrefix ? `${tourPrefix}-title` : undefined}
        >
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {heading}
          </h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {hasToolbar && (
          <div
            data-tour={toolbarTourId}
            className="flex shrink-0 items-center justify-between gap-4 px-3 py-2 rounded-xl border max-sm:flex-col max-sm:items-stretch max-sm:gap-2 max-sm:p-2 bg-slate-200/40 border-slate-200/40 dark:bg-slate-800/70 dark:border-slate-700/60 backdrop-blur-md dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)]"
          >
            <div className="flex flex-wrap items-center gap-2 max-sm:flex-col max-sm:items-stretch max-sm:[&>*]:w-full!">
              {toolbar}
              {search && (
                <div className="relative w-64 sm:w-72 max-sm:w-full">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    value={search.value}
                    onChange={(e) => search.onChange(e.target.value)}
                    placeholder={search.placeholder}
                    className="pl-8 h-8 text-xs max-sm:h-10 bg-white/80 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-700/60 focus-visible:ring-1 focus-visible:ring-primary/40"
                  />
                </div>
              )}
              {filters}
            </div>

            {(count || toolbarActions) && (
              <div className="flex shrink-0 items-center gap-3 max-sm:justify-between">
                {toolbarActions && (
                  <div className="flex items-center gap-1.5">
                    {toolbarActions}
                  </div>
                )}

                {count && (
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                    {count.value === undefined
                      ? "—"
                      : `${count.value} ${count.value === 1 ? count.singular : count.plural}`}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {children}
      </div>
    </ContentLayout>
  );
}
