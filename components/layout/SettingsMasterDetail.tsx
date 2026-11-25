"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  Inbox,
  RefreshCw,
  SearchX,
  TriangleAlert,
} from "lucide-react";

import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { EmptyState } from "@/components/misc/EmptyState";
import { TagBadge } from "@/components/misc/TagBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** `ready` = configurado, `idle` = falta quién lo reciba, `off` = apagado. */
export type MasterItemStatus = "ready" | "idle" | "off";

export interface MasterDetailItem {
  key: string;
  label: string;
  group: string | null;
  description: string | null;
  status: MasterItemStatus;
  /** Resumen corto bajo el nombre en la lista ("3 reglas activas"). */
  summary: string;
}

const DOT: Record<MasterItemStatus, string> = {
  ready: "bg-emerald-500",
  idle: "bg-amber-500",
  off: "bg-slate-300 dark:bg-slate-600",
};

const NO_GROUP = "General";

const surface =
  "rounded-xl border border-slate-200 bg-white dark:border-slate-700/60 dark:bg-slate-900/60";

/**
 * Pantalla de configuración con lista a la izquierda y panel de ajustes a la
 * derecha: elegir un elemento muestra sus secciones sin salir de la página.
 * En escritorio cada columna desplaza por dentro (la página usa `fill`); en
 * móvil se ve una cosa a la vez, la lista o el panel, con "Volver".
 *
 * No sabe nada del contenido: quien la usa da los elementos, el control del
 * encabezado y las secciones de cada panel.
 */
export function SettingsMasterDetail<T extends MasterDetailItem>({
  items,
  loading,
  error,
  errorMessage,
  onRetry,
  emptyMessage,
  filtered,
  headerAction,
  children,
}: {
  items: T[];
  loading: boolean;
  error: boolean;
  errorMessage: string;
  onRetry: () => void;
  emptyMessage: string;
  /** Hay una búsqueda activa: un listado vacío es "sin coincidencias". */
  filtered: boolean;
  /** Control a la derecha del título del panel (interruptor, botón…). */
  headerAction?: (item: T) => ReactNode;
  /** Secciones del panel del elemento elegido. */
  children: (item: T) => ReactNode;
}) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const groups = useMemo(() => {
    const byGroup = new Map<string, T[]>();
    for (const item of items) {
      const group = item.group ?? NO_GROUP;
      byGroup.set(group, [...(byGroup.get(group) ?? []), item]);
    }
    return [...byGroup.entries()];
  }, [items]);

  // Lo elegido por el usuario. Si ya no está (búsqueda, recarga) en escritorio
  // se muestra el primero de la lista tal como se ve, y en móvil vuelve la lista.
  const chosen = items.find((item) => item.key === selectedKey);
  const active = chosen ?? groups[0]?.[1][0];

  // En móvil la página desplaza: al abrir un panel desde el final de una lista
  // larga hay que llevar la vista a su inicio.
  useEffect(() => {
    if (!selectedKey) return;
    if (window.matchMedia("(min-width: 768px)").matches) return;
    panelRef.current?.scrollIntoView({ block: "start" });
  }, [selectedKey]);

  if (error || (!loading && items.length === 0)) {
    return (
      <div
        className={cn(
          surface,
          "flex items-center justify-center py-12 max-md:h-[max(12rem,calc(100dvh-30rem))] md:flex-1",
        )}
      >
        {error ? (
          <EmptyState
            tone="error"
            icon={TriangleAlert}
            title={errorMessage}
            description="Revise su conexión e inténtelo de nuevo."
            action={
              <Button
                variant="outline"
                size="sm"
                className="mt-1 h-8 gap-2 max-sm:h-10"
                onClick={onRetry}
              >
                <RefreshCw className="size-3.5" />
                Reintentar
              </Button>
            }
          />
        ) : filtered ? (
          <EmptyState
            icon={SearchX}
            title="Sin coincidencias"
            description="Ningún registro coincide con la búsqueda aplicada."
          />
        ) : (
          <EmptyState icon={Inbox} title={emptyMessage} />
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:min-h-0 md:flex-1 md:grid-cols-[19rem_minmax(0,1fr)] md:grid-rows-[minmax(0,1fr)]">
      <div
        className={cn(
          surface,
          "overflow-hidden md:flex md:flex-col",
          chosen && "max-md:hidden",
        )}
      >
        <div className="md:min-h-0 md:flex-1 md:overflow-y-auto md:overscroll-contain">
          {loading ? (
            <div className="space-y-2 p-3">
              {Array.from({ length: 7 }, (_, index) => (
                <Skeleton key={index} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <nav aria-label="Elementos configurables">
              {groups.map(([group, groupItems]) => (
                <div key={group}>
                  <p className="border-b bg-muted/30 px-4 py-2 text-[13px] font-semibold text-foreground/80 not-first:border-t">
                    {group}
                    <span className="ml-1.5 font-normal text-muted-foreground tabular-nums">
                      · {groupItems.length}
                    </span>
                  </p>
                  <ul className="divide-y divide-border/60">
                    {groupItems.map((item) => {
                      const isActive = item.key === active?.key;

                      return (
                        <li key={item.key}>
                          <button
                            type="button"
                            aria-current={isActive ? "true" : undefined}
                            onClick={() => setSelectedKey(item.key)}
                            className={cn(
                              "relative flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted/40 max-md:py-3",
                              isActive &&
                                "bg-primary/5 before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-primary hover:bg-primary/5",
                            )}
                          >
                            <span
                              aria-hidden
                              className={cn(
                                "mt-1.5 size-2 shrink-0 rounded-full",
                                DOT[item.status],
                              )}
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-semibold text-slate-700 wrap-anywhere dark:text-slate-200">
                                {item.label}
                              </span>
                              <span className="block text-xs text-slate-600 dark:text-slate-300">
                                {item.summary}
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          )}
        </div>
      </div>

      {loading && <Skeleton className="h-40 rounded-xl max-md:hidden" />}

      {active && (
        <div
          ref={panelRef}
          key={active.key}
          className={cn(
            "min-w-0 space-y-4 md:-m-1 md:min-h-0 md:overflow-y-auto md:overscroll-contain md:p-1",
            !chosen && "max-md:hidden",
          )}
        >
          <ActionTriggerButton
            type="button"
            size="sm"
            className="md:hidden max-sm:h-10"
            onClick={() => setSelectedKey(null)}
          >
            <ArrowLeft className="mr-2 size-4" />
            Volver a la lista
          </ActionTriggerButton>

          <div
            className={cn(
              surface,
              "flex items-start justify-between gap-4 px-4 py-3 max-sm:flex-col",
            )}
          >
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <h2 className="text-lg font-semibold tracking-tight wrap-anywhere">
                  {active.label}
                </h2>
                {active.group && <TagBadge tone="sky">{active.group}</TagBadge>}
              </div>
              {active.description && (
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {active.description}
                </p>
              )}
            </div>
            {headerAction && (
              <div className="shrink-0">{headerAction(active)}</div>
            )}
          </div>

          {children(active)}
        </div>
      )}
    </div>
  );
}
