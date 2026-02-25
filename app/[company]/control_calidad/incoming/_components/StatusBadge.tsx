import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status?: string }) {
  const map: Record<string, { label: string; className: string }> = {
    CHECKING: {
      label: "Incoming",
      className:
        "bg-amber-500/15 text-amber-700 border-amber-400/30",
    },
    INCOMING: {
      label: "Incoming",
      className:
        "bg-amber-500/15 text-amber-700 border-amber-400/30",
    },
    STORED: {
      label: "Stored",
      className:
        "bg-emerald-500/15 text-emerald-700 border-emerald-400/30",
    },
    DISPATCH: {
      label: "Dispatch",
      className: "bg-sky-500/15 text-sky-700 border-sky-400/30",
    },
    INTRANSIT: {
      label: "In transit",
      className:
        "bg-violet-500/15 text-violet-700 border-violet-400/30",
    },
    HOLD: {
      label: "Hold",
      className: "bg-red-500/15 text-red-700 border-red-400/30",
    },
    REJECTED: {
      label: "Rejected",
      className: "bg-red-500/15 text-red-700 border-red-400/30",
    },
  };

  const meta =
    map[status ?? ""] ?? {
      label: status ?? "—",
      className: "bg-muted text-muted-foreground border-muted",
    };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        meta.className
      )}
    >
      {meta.label}
    </span>
  );
}
