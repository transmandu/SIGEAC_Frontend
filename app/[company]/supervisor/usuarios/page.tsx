"use client";

import { useMemo, useState } from "react";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { useOnlineUsersContext } from "@/contexts/OnlineUsersContext";
import { useGetUserSessions } from "@/hooks/supervisor/useUserSessions";
import { useNow } from "@/hooks/useNow";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { UserActivityRow } from "@/types/user-sessions";
import { summarize } from "./_lib/activity";
import { AttentionPanel } from "./_components/AttentionPanel";
import {
  DirectoryPanel,
  type DirectoryFilter,
} from "./_components/DirectoryPanel";
import { LiveNowPanel } from "./_components/LiveNowPanel";
import { SummaryStrip } from "./_components/SummaryStrip";

/**
 * SUPERVISAR USUARIOS — exclusivo de SUPERUSER (lo exige el layout y el backend).
 *
 * La presencia viene del socket; la última actividad y las sesiones, del
 * servidor. Se cruzan aquí para que todos los paneles lean la misma fila.
 */
export default function SupervisarUsuariosPage() {
  const { selectedCompany } = useCompanyStore();
  const { data, isPending, isError, refetch } = useGetUserSessions(
    selectedCompany?.slug,
  );
  const { getPresenceStatus } = useOnlineUsersContext();
  const now = useNow(30_000);

  const [filter, setFilter] = useState<DirectoryFilter>("all");

  const rows = useMemo<UserActivityRow[]>(
    () =>
      (data ?? []).map((user) => ({
        ...user,
        presence: getPresenceStatus(user.id),
      })),
    [data, getPresenceStatus],
  );

  const summary = useMemo(() => summarize(rows, now), [rows, now]);

  return (
    <ContentLayout title="Supervisar Usuarios">
      <div className="flex flex-col gap-6">
        <PageHeader />

        <div className="flex flex-col gap-2 border-b border-border/60 pb-4">
          <h1 className="min-w-0 text-2xl font-semibold tracking-tight wrap-break-word md:text-3xl">
            Usuarios
          </h1>
          <p className="text-sm text-muted-foreground">
            Quién está conectado y qué cuentas conviene revisar. Desde aquí
            puede cerrar sesiones.
          </p>
        </div>

        <SummaryStrip
          summary={summary}
          loading={isPending}
          onSelect={setFilter}
        />

        {!isPending && !isError && (
          <div
            className={cn(
              "grid items-start gap-6",
              summary.attention > 0 && "lg:grid-cols-2",
            )}
          >
            <LiveNowPanel rows={rows} now={now} />
            {summary.attention > 0 && (
              <AttentionPanel rows={rows} now={now} />
            )}
          </div>
        )}

        <DirectoryPanel
          rows={rows}
          now={now}
          filter={filter}
          onFilterChange={setFilter}
          loading={isPending}
          error={isError}
          onRetry={() => refetch()}
        />
      </div>
    </ContentLayout>
  );
}
