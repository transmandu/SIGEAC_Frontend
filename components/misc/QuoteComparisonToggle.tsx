'use client';

import { useState } from 'react';
import { ArrowRight, ChevronDown, MessageSquareText, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompareField {
  label: string;
  requested?: string | number | null;
  quoted?: string | number | null;
  changed: boolean;
}

interface QuoteComparisonToggleProps {
  fields: CompareField[];
  justification?: string | null;
  className?: string;
}

const CompareRow = ({ label, requested, quoted, changed }: CompareField) => (
  <div className="flex items-center justify-between gap-2 text-[11px]">
    <span className="shrink-0 text-muted-foreground/70">{label}</span>
    {changed ? (
      <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
        <span className="tabular-nums line-through opacity-60">{requested ?? '—'}</span>
        <ArrowRight className="size-2.5 shrink-0" />
        <span className="tabular-nums font-semibold">{quoted ?? '—'}</span>
      </div>
    ) : (
      <span className="tabular-nums font-medium text-foreground/80">{quoted ?? '—'}</span>
    )}
  </div>
);

/**
 * Pie de card unificado: un solo trigger que expande, lado a lado (50/50),
 * la comparativa solicitado-vs-cotizado y la justificación del cambio —
 * en vez de dos bloques apilados con su propio borde cada uno.
 */
const QuoteComparisonToggle = ({ fields, justification, className }: QuoteComparisonToggleProps) => {
  const [expanded, setExpanded] = useState(false);
  const hasComparison = fields.some((f) => f.changed);
  const hasJustification = !!justification?.trim();

  if (!hasComparison && !hasJustification) return null;

  const triggerLabel = hasComparison && hasJustification
    ? 'Ver comparativa y justificación'
    : hasComparison
    ? 'Ver comparativa'
    : 'Ver justificación';

  return (
    <div className={cn('border-t border-border/50', className)}>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium text-[#2f716f] dark:text-[#6fc2bf] hover:bg-[#439A97]/10 transition-colors"
      >
        {hasComparison ? <Scale className="size-3" /> : <MessageSquareText className="size-3" />}
        {triggerLabel}
        <ChevronDown className={cn('size-3 transition-transform', expanded && 'rotate-180')} />
      </button>

      {expanded && (
        <div
          className={cn(
            'grid gap-x-4 gap-y-3 border-t border-border/50 bg-muted/10 px-3 py-2.5',
            hasComparison && hasJustification && 'grid-cols-1 sm:grid-cols-2'
          )}
        >
          {hasComparison && (
            <div className="space-y-1.5">
              <span className="block text-[9px] font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400">
                Solicitado vs. cotizado
              </span>
              {fields
                .filter((f) => f.changed)
                .map((field) => (
                  <CompareRow key={field.label} {...field} />
                ))}
            </div>
          )}

          {hasJustification && (
            <div className="space-y-1.5">
              <span className="block text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                Justificación
              </span>
              <p className="text-xs text-foreground/80 leading-snug">{justification}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuoteComparisonToggle;
