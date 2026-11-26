"use client";

import { Radio } from "lucide-react";

import { PanelSection } from "@/components/forms/PanelSection";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { fullName } from "@/lib/person-name";
import type { UserActivityRow } from "@/types/user-sessions";
import {
  PRESENCE_META,
  elapsedLabel,
  isConnected,
} from "@/app/[company]/supervisor/usuarios/_lib/activity";
import { UserAvatar } from "./UserAvatar";

/** Nombre corto para la tira: primer nombre y apellido. */
const shortName = (user: UserActivityRow) =>
  fullName(
    {
      first_name: user.first_name?.trim().split(/\s+/)[0],
      last_name: user.last_name?.trim().split(/\s+/)[0],
    },
    user.username,
  );

/** Quién tiene el sistema abierto ahora: una tira de avatares, el detalle al apuntar. */
export function LiveNowPanel({
  rows,
  now,
}: {
  rows: UserActivityRow[];
  now: Date;
}) {
  const connected = rows
    .filter(isConnected)
    .sort(
      (a, b) =>
        Number(b.presence === "online") - Number(a.presence === "online") ||
        a.name.localeCompare(b.name),
    );

  return (
    <PanelSection icon={Radio} title="Conectados ahora">
      {connected.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          Nadie conectado en este momento.
        </p>
      ) : (
        <ul className="flex flex-wrap gap-x-5 gap-y-4">
          {connected.map((user) => (
            <li key={user.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="flex w-20 flex-col items-center gap-1.5 rounded-lg p-1 text-center focus-visible:outline-2 focus-visible:outline-primary/40"
                  >
                    <UserAvatar user={user} />
                    <span className="w-full truncate text-xs text-slate-600 dark:text-slate-300">
                      {shortName(user)}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="px-2 py-1 text-xs">
                  {user.name} · {PRESENCE_META[user.presence].label} ·{" "}
                  {elapsedLabel(user.last_used_at, now).toLowerCase()}
                </TooltipContent>
              </Tooltip>
            </li>
          ))}
        </ul>
      )}
    </PanelSection>
  );
}
