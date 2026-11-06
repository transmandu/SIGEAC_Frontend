import { cn } from "@/lib/utils";
import { formatCalendarDate } from "@/lib/date";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const QUOTE_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
};

export const statusLabel = (status?: string) =>
  QUOTE_STATUS_LABELS[status ?? ""] ?? status ?? "—";

export const statusBadgeCls = (status?: string) => {
  const approved = status === "APPROVED";
  const rejected = status === "REJECTED";
  const pending = status === "PENDING";

  return cn(
    "rounded-md border h-6 px-2.5 text-xs font-medium transition-colors duration-150 cursor-default hover:scale-100 hover:translate-y-0 select-none",

    approved &&
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15 dark:hover:text-emerald-200",

    rejected &&
      "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300 hover:bg-red-500/15 dark:hover:text-red-200",

    pending &&
      "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/15 dark:hover:text-amber-200",
  );
};

// Fecha de calendario: se muestra tal cual, sin convertir de zona.
export const formatQuoteDate = (
  date?: string | Date | null,
): string | undefined => formatCalendarDate(date, "dd MMM yyyy", "—");
