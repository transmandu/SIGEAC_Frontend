"use client";

import { useDeferredValue, useMemo, useState } from "react";
import {
  ChevronRight,
  Inbox,
  RefreshCw,
  Search,
  SearchX,
  TriangleAlert,
  Users,
} from "lucide-react";

import { PanelSection } from "@/components/forms/PanelSection";
import { EmptyState } from "@/components/misc/EmptyState";
import {
  SegmentedTabs,
  SegmentedTabsList,
  SegmentedTabsTrigger,
} from "@/components/misc/SegmentedTabs";
import { TagBadge } from "@/components/misc/TagBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { UserActivityRow } from "@/types/user-sessions";
import {
  PRESENCE_META,
  attentionOf,
  elapsedLabel,
  isConnected,
} from "@/app/[company]/supervisor/usuarios/_lib/activity";
import { CloseSessionsAction } from "./CloseSessionsAction";
import { ManageUserLink } from "./ManageUserLink";
import { UserAvatar } from "./UserAvatar";
import { UserSessionsRow } from "./UserSessionsRow";

export type DirectoryFilter = "all" | "connected" | "attention";

const matches = (user: UserActivityRow, q: string) =>
  [user.name, user.username].some((value) => value?.toLowerCase().includes(q));

function DirectoryList({
  users,
  now,
}: {
  users: UserActivityRow[];
  now: Date;
}) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <ul className="max-h-128 divide-y divide-border/60 overflow-y-auto overscroll-contain max-md:max-h-[70dvh]">
      {users.map((user) => {
        const expanded = expandedId === user.id;
        const meta = PRESENCE_META[user.presence];

        return (
          <li key={user.id}>
            <div className="flex items-center gap-2 px-4 py-3">
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => setExpandedId(expanded ? null : user.id)}
                className="grid min-w-0 flex-1 grid-cols-[1rem_auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 text-left md:grid-cols-[1rem_auto_minmax(0,1fr)_9.5rem_8.5rem]"
              >
                <ChevronRight
                  aria-hidden
                  className={cn(
                    "size-3.5 text-muted-foreground/50 transition-transform",
                    expanded && "rotate-90 text-blue-600 dark:text-blue-400",
                  )}
                />
                <UserAvatar user={user} />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold wrap-anywhere text-slate-700 dark:text-slate-200 max-md:text-base">
                    {user.name}
                  </span>
                  <span className="block text-xs text-muted-foreground wrap-anywhere">
                    {user.username}
                  </span>
                </span>

                <span className="flex flex-wrap items-center gap-x-3 gap-y-1 max-md:col-start-3 md:contents">
                  <span className="md:justify-self-center">
                    {user.is_active ? (
                      <TagBadge tone={meta.tone}>{meta.label}</TagBadge>
                    ) : (
                      <TagBadge tone="rose">Deshabilitado</TagBadge>
                    )}
                  </span>
                  <span className="text-[13px] text-muted-foreground tabular-nums md:justify-self-center">
                    {elapsedLabel(user.last_used_at, now)}
                  </span>
                </span>
              </button>

              <ManageUserLink userId={user.id} />
              {user.sessions.length > 0 ? (
                <CloseSessionsAction user={user} />
              ) : (
                <span aria-hidden className="size-9 shrink-0" />
              )}
            </div>

            {expanded && (
              <div className="border-t border-border/60 bg-muted/20 md:pl-14">
                <UserSessionsRow user={user} />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Todos los usuarios de la compañía, con buscador y pestañas; cada fila abre sus sesiones. */
export function DirectoryPanel({
  rows,
  now,
  filter,
  onFilterChange,
  loading,
  error,
  onRetry,
}: {
  rows: UserActivityRow[];
  now: Date;
  filter: DirectoryFilter;
  onFilterChange: (filter: DirectoryFilter) => void;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}) {
  const [search, setSearch] = useState("");
  const query = useDeferredValue(search).trim().toLowerCase();

  const counts = useMemo(
    () => ({
      all: rows.length,
      connected: rows.filter(isConnected).length,
      attention: rows.filter((user) => attentionOf(user, now)).length,
    }),
    [rows, now],
  );

  const filtered = useMemo(
    () =>
      rows.filter((user) => {
        if (filter === "connected" && !isConnected(user)) return false;
        if (filter === "attention" && !attentionOf(user, now)) return false;

        return !query || matches(user, query);
      }),
    [rows, filter, query, now],
  );

  const count = (value: number) => (loading ? "…" : value);

  return (
    <PanelSection icon={Users} title="Directorio" flush>
      <div className="flex flex-col gap-2 border-b border-border/60 p-3 md:flex-row md:items-center md:justify-between">
        <SegmentedTabs
          value={filter}
          onValueChange={(value) => onFilterChange(value as DirectoryFilter)}
        >
          <SegmentedTabsList>
            <SegmentedTabsTrigger value="all">
              Todos ({count(counts.all)})
            </SegmentedTabsTrigger>
            <SegmentedTabsTrigger value="connected">
              Conectados ({count(counts.connected)})
            </SegmentedTabsTrigger>
            <SegmentedTabsTrigger value="attention">
              Atención ({count(counts.attention)})
            </SegmentedTabsTrigger>
          </SegmentedTabsList>
        </SegmentedTabs>

        <div className="relative w-full md:w-72">
          <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre o usuario..."
            className="h-8 border-slate-200/60 bg-white/80 pl-8 text-xs focus-visible:ring-1 focus-visible:ring-primary/40 max-sm:h-10 max-sm:text-base dark:border-slate-700/60 dark:bg-slate-900/60"
          />
        </div>
      </div>

      {loading ? (
        <div className="divide-y divide-border/60">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="size-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <EmptyState
          tone="error"
          icon={TriangleAlert}
          title="No se pudo cargar la actividad de los usuarios"
          className="py-12"
          action={
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="mr-2 size-3.5" />
              Reintentar
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={query ? SearchX : Inbox}
          title={query ? "Sin coincidencias" : "No hay usuarios en esta vista."}
          className="py-12"
        />
      ) : (
        <DirectoryList key={`${filter}|${query}`} users={filtered} now={now} />
      )}
    </PanelSection>
  );
}
