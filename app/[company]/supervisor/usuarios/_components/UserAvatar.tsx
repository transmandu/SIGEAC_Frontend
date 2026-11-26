import type { PresenceStatus } from "@/hooks/notifications/useOnlineUsers";
import { initialsOf } from "@/lib/person-name";
import { cn } from "@/lib/utils";
import type { UserActivityRow } from "@/types/user-sessions";
import { PRESENCE_META } from "@/app/[company]/supervisor/usuarios/_lib/activity";

/** Iniciales con el punto de presencia en la esquina; apagado si la cuenta está deshabilitada. */
export function UserAvatar({
  user,
  presence = user.presence,
}: {
  user: UserActivityRow;
  presence?: PresenceStatus;
}) {
  return (
    <div className="relative shrink-0">
      <div
        className={cn(
          "grid size-9 place-items-center rounded-full border text-[13px] font-semibold",
          user.is_active
            ? "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300"
            : "border-slate-300/60 bg-muted text-muted-foreground",
        )}
      >
        {initialsOf(user) || user.username.slice(0, 2)}
      </div>
      <span
        aria-hidden
        className={cn(
          "absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-white dark:border-slate-900",
          user.is_active ? PRESENCE_META[presence].dot : "bg-rose-500",
        )}
      />
    </div>
  );
}
