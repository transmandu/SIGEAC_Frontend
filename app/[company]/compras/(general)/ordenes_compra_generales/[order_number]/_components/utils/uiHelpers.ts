import { cn } from "@/lib/utils";
import { formatCalendarDate, formatInstant } from "@/lib/date";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const PO_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  PAID: "Pagada",
  COMPLETED: "Completada",
};

export const statusLabel = (status?: string) =>
  PO_STATUS_LABELS[status ?? ""] ?? status ?? "—";

export const statusBadgeCls = (status?: string) => {
  const completed = status === "PAID" || status === "COMPLETED";
  const pending = status === "PENDING";

  return cn(
    "rounded-md border h-6 px-2.5 text-xs font-medium transition-colors duration-150 cursor-default hover:scale-100 hover:translate-y-0 select-none",

    completed &&
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15 dark:hover:text-emerald-200",

    pending &&
      "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/15 dark:hover:text-amber-200",
  );
};

// `purchase_date` es un instante (datetime): se lee en la zona de la compañía.
export const formatPurchaseDate = (
  date: string | Date | null | undefined,
  timeZone: string,
): string => formatInstant(date, timeZone, "dd MMM yyyy", "—");
