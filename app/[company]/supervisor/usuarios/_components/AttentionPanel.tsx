"use client";

import {
  Clock,
  Copy,
  ShieldAlert,
  UserX,
  type LucideIcon,
} from "lucide-react";

import { PanelSection } from "@/components/forms/PanelSection";
import { cn } from "@/lib/utils";
import type { UserActivityRow } from "@/types/user-sessions";
import {
  attentionOf,
  elapsedLabel,
  type Attention,
  type AttentionKind,
} from "@/app/[company]/supervisor/usuarios/_lib/activity";
import { CloseSessionsAction } from "./CloseSessionsAction";
import { ManageUserLink } from "./ManageUserLink";
import { UserAvatar } from "./UserAvatar";

const KIND_ICON: Record<AttentionKind, LucideIcon> = {
  "disabled-with-session": ShieldAlert,
  "multiple-sessions": Copy,
  "never-signed-in": UserX,
  stale: Clock,
};

const TONE_BOX: Record<Attention["tone"], string> = {
  rose: "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400",
  amber:
    "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  slate: "border-border/60 bg-muted text-muted-foreground",
};

const SEVERITY: Record<AttentionKind, number> = {
  "disabled-with-session": 0,
  "multiple-sessions": 1,
  stale: 2,
  "never-signed-in": 3,
};

/** Cuentas con algo que revisar; lo más grave primero y, si cabe, su acción a un clic. */
export function AttentionPanel({
  rows,
  now,
}: {
  rows: UserActivityRow[];
  now: Date;
}) {
  const flagged = rows
    .map((user) => ({ user, attention: attentionOf(user, now) }))
    .filter(
      (item): item is { user: UserActivityRow; attention: Attention } =>
        item.attention !== null,
    )
    .sort(
      (a, b) =>
        SEVERITY[a.attention.kind] - SEVERITY[b.attention.kind] ||
        a.user.name.localeCompare(b.user.name),
    );

  return (
    <PanelSection icon={ShieldAlert} title="Requieren atención" flush>
      {flagged.length > 0 && (
        <ul className="max-h-72 divide-y divide-border/60 overflow-y-auto">
          {flagged.map(({ user, attention }) => {
            const Icon = KIND_ICON[attention.kind];

            return (
              <li key={user.id} className="flex items-center gap-3 px-4 py-3">
                <UserAvatar user={user} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold wrap-anywhere text-slate-700 dark:text-slate-200">
                    {user.name}
                  </p>
                  <p className="flex items-start gap-1.5 text-[13px] text-slate-600 dark:text-slate-300">
                    <span
                      aria-hidden
                      className={cn(
                        "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border",
                        TONE_BOX[attention.tone],
                      )}
                    >
                      <Icon className="size-3" />
                    </span>
                    <span className="wrap-anywhere">
                      {attention.label}
                      {attention.kind === "stale" && (
                        <span className="text-muted-foreground">
                          {" "}
                          · {elapsedLabel(user.last_used_at, now)}
                        </span>
                      )}
                    </span>
                  </p>
                </div>
                <ManageUserLink userId={user.id} />
                {user.sessions.length > 0 && <CloseSessionsAction user={user} />}
              </li>
            );
          })}
        </ul>
      )}
    </PanelSection>
  );
}
