import { format } from "date-fns";
import { es } from "date-fns/locale";
import { formatCalendarDate } from "@/lib/date";

export const priorityLabel = (priority?: string) => {
  switch (priority) {
    case "LOW":
      return "Baja";
    case "MEDIUM":
      return "Media";
    case "HIGH":
      return "Alta";
    default:
      return "—";
  }
};

export const articleStatusUI = (status?: string) => {
  switch (status) {
    case "PENDING":
      return {
        label: "Pendiente",
        className:
          "border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-500/15 dark:hover:text-yellow-200 select-none",
      };

    case "APPROVED":
      return {
        label: "Aprobado",
        className:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15 dark:hover:text-emerald-200 select-none",
      };

    case "PARTIAL":
      return {
        label: "Parcial",
        className:
          "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/15 dark:hover:text-amber-200 select-none",
      };

    case "REJECTED":
      return {
        label: "Rechazado",
        className:
          "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300 hover:bg-red-500/15 dark:hover:text-red-200 select-none",
      };

    default:
      return {
        label: "—",
        className: "select-none",
      };
  }
};

export const requisitionStatusLabel = (status?: string) => {
  switch (status) {
    case "CREATED":
      return "Creada";
    case "RECEIVED":
      return "Recibida";
    case "IN_PROGRESS":
      return "En proceso";
    case "QUOTED":
      return "Cotizada";
    case "APPROVED":
      return "Aprobada";
    case "REJECTED":
      return "Rechazada";
    default:
      return status ?? "—";
  }
};

export const statusBadgeCls = (status?: string) => {
  const created = status === "CREATED";
  const received = status === "RECEIVED";
  const process = status === "IN_PROGRESS" || status === "QUOTED";
  const approved = status === "APPROVED";

  return [
    "rounded-md border h-6 px-2.5 text-xs font-medium transition-colors duration-150 hover:scale-100 hover:translate-y-0 select-none",
    created &&
      "border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300 hover:bg-slate-500/15 dark:hover:text-slate-200",
    received &&
      "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300 hover:bg-sky-500/15 dark:hover:text-sky-200",
    process &&
      "border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-500/15 dark:hover:text-yellow-200",
    approved &&
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15 dark:hover:text-emerald-200",
    !created &&
      !received &&
      !process &&
      !approved &&
      "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300 hover:bg-red-500/15 dark:hover:text-red-200",
  ]
    .filter(Boolean)
    .join(" ");
};

// Priority badge for the requisition detail page — identical shape to statusBadgeCls
export const priorityPageBadgeCls = (priority?: string) => {
  const low = priority === "LOW";
  const medium = priority === "MEDIUM";
  const high = priority === "HIGH";

  return [
    "inline-flex items-center justify-center whitespace-nowrap rounded-md border h-6 px-2.5 text-xs font-medium transition-colors duration-150 hover:scale-100 hover:translate-y-0 select-none cursor-default",
    low &&
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15 dark:hover:text-emerald-200",
    medium &&
      "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300 hover:bg-orange-500/15 dark:hover:text-orange-200",
    high &&
      "border-red-600 bg-red-600 font-semibold text-white hover:bg-red-600 dark:border-red-500 dark:bg-red-500",
    !low &&
      !medium &&
      !high &&
      "border-slate-500/30 bg-slate-500/10 text-muted-foreground",
  ]
    .filter(Boolean)
    .join(" ");
};

export const requisitionTypeLabel = (type?: string) => {
  switch (type) {
    case "AERONAUTICAL":
      return "material aeronáutico";

    default:
      return "uso general";
  }
};

// Fecha de calendario: se muestra tal cual, sin convertir de zona.
export const formatSolicitudDate = (
  date?: string | Date | null,
): string | undefined => formatCalendarDate(date, "dd MMM yyyy", "—");
