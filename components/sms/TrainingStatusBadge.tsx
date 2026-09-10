"use client";

import { cn } from "@/lib/utils";
import { trainingStatusLabelEsUpper } from "@/lib/cursos/statuses";

const STATUS_STYLES: Record<string, string> = {
  VALID:
    "border-transparent bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  EXPIRING_SOON:
    "border-transparent bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400",
  EXPIRED: "border-transparent bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  // El inicial venció (su recurrente dejó de mantenerlo vigente): hay que
  // repetir el curso INICIAL. Neutro pero llamativo, distinto de EXPIRED.
  PENDING:
    "border-transparent bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
};

export function TrainingStatusBadge({
  status,
  className,
}: {
  status?: string | null;
  className?: string;
}) {
  if (!status) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-muted text-muted-foreground",
          className
        )}
      >
        N/A
      </span>
    );
  }

  const key = status.trim().toUpperCase();
  const style = STATUS_STYLES[key] ?? "border-transparent bg-muted text-muted-foreground";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        style,
        className
      )}
    >
      {trainingStatusLabelEsUpper(key)}
    </span>
  );
}
