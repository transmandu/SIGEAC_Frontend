import { MapPin } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn, formatDate } from '@/lib/utils';

import {
    getActionLabel,
    getActionTone,
    getReportCode,
    isSelectable,
    ReportType,
    ReportWithHazard,
} from './report-helpers';

type ReportCardProps<T extends { id: number; report_date: string | Date; description: string; status: string }> = {
    report: ReportWithHazard<T>;
    type: ReportType;
    selected: boolean;
    meta: string;
    onSelect: () => void;
};

export function ReportCard<T extends { id: number; report_date: string | Date; description: string; status: string }>({
    report,
    type,
    selected,
    meta,
    onSelect,
}: ReportCardProps<T>) {
    const selectable = isSelectable(report);

    return (
        <button
            type="button"
            onClick={onSelect}
            disabled={!selectable}
            className={cn(
                'w-full rounded-lg border p-4 text-left transition-colors',
                selected && 'border-primary bg-primary/5',
                selectable && 'hover:border-primary/50 hover:bg-accent/40',
                !selectable && 'cursor-not-allowed opacity-65'
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <p className="text-sm font-semibold">{getReportCode(report, type)}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(report.report_date)}</p>
                </div>
                <Badge className={cn('border', getActionTone(report))}>{getActionLabel(report)}</Badge>
            </div>

            <p className="mt-3 line-clamp-3 text-sm">{report.description}</p>

            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span>{meta || 'Sin ubicación asociada'}</span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
                <Badge variant="outline">{report.status}</Badge>
                {selected && <span className="text-xs font-medium">Seleccionado</span>}
            </div>
        </button>
    );
}
