"use client";

import React from "react";
import { Search } from "lucide-react";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";

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
  children,
}: SettingsListPageProps) {
  const hasToolbar = !!search || !!filters || !!toolbar || !!count;

  return (
    <ContentLayout title={title}>
      <div className="flex flex-col gap-6">
        <PageHeader />

        <div
          className="flex flex-col gap-2 border-b pb-4"
          data-tour={tourPrefix ? `${tourPrefix}-title` : undefined}
        >
          <h1 className="text-3xl font-semibold tracking-tight">{heading}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {hasToolbar && (
          <div className="flex items-center justify-between gap-4 px-3 py-2 rounded-xl border bg-slate-200/40 border-slate-200/40 dark:bg-slate-800/70 dark:border-slate-700/60 backdrop-blur-md dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
            <div className="flex flex-wrap items-center gap-2">
              {toolbar}
              {search && (
                <div className="relative w-64 sm:w-72">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    value={search.value}
                    onChange={(e) => search.onChange(e.target.value)}
                    placeholder={search.placeholder}
                    className="pl-8 h-8 text-xs bg-white/80 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-700/60 focus-visible:ring-1 focus-visible:ring-primary/40"
                  />
                </div>
              )}
              {filters}
            </div>

            {count && (
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                {count.value === undefined
                  ? "—"
                  : `${count.value} ${count.value === 1 ? count.singular : count.plural}`}
              </span>
            )}
          </div>
        )}

        {children}
      </div>
    </ContentLayout>
  );
}
