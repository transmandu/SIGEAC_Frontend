import { Check, FileText, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";

import {
  getActionLabel,
  getActionTone,
  getReportCode,
  isSelectable,
  ReportType,
  ReportWithHazard,
} from "./report-helpers";

type ReportCardProps<
  T extends {
    id: number;
    report_date: string | Date;
    description: string;
    status: string;
  },
> = {
  report: ReportWithHazard<T>;
  type: ReportType;
  selected: boolean;
  meta: string;
  onSelect: () => void;
};

export function ReportCard<
  T extends {
    id: number;
    report_date: string | Date;
    description: string;
    status: string;
  },
>({ report, type, selected, meta, onSelect }: ReportCardProps<T>) {
  const selectable = isSelectable(report);

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={!selectable}
      aria-pressed={selected}
      title={
        selectable
          ? undefined
          : "Solo puede abrir reportes abiertos o con notificación registrada."
      }
      className={cn(
        "group w-full rounded-lg border bg-card p-3 text-left transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden",
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary/25"
          : "hover:border-primary/40 hover:bg-accent/40",
        !selectable &&
          "cursor-not-allowed opacity-60 hover:border-border hover:bg-card",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
            selected
              ? "border-primary bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          {selected ? (
            <Check className="h-4 w-4" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold tracking-tight tabular-nums">
              {getReportCode(report, type)}
            </p>
            <Badge className={cn("shrink-0 border", getActionTone(report))}>
              {getActionLabel(report)}
            </Badge>
          </div>

          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatDate(report.report_date)}
            <span className="mx-1.5">·</span>
            {report.status}
          </p>

          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {report.description}
          </p>

          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{meta || "Sin ubicación asociada"}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
