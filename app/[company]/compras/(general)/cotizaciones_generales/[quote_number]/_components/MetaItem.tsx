import { ElementType } from 'react';
import { cn } from '@/lib/utils';

interface MetaItemProps {
  label: string;
  value?: string | null;
  icon?: ElementType;
  wrap?: boolean;
  /** When true, wraps to at most 2 lines and truncates the overflow with an ellipsis. */
  clamp?: boolean;
}

const MetaItem = ({ label, value, icon: Icon, wrap, clamp }: MetaItemProps) => {
  return (
    <div className={cn('flex flex-col gap-0.5', (wrap || clamp) && 'min-w-0 max-w-[260px]')}>
      <span className="text-[10px] font-medium tracking-wider text-muted-foreground/60 select-none">
        {label}
      </span>
      <span
        className={cn(
          'text-sm font-medium flex gap-1.5',
          wrap || clamp ? 'items-start' : 'items-center',
          wrap && !clamp && 'text-wrap break-words'
        )}
      >
        {Icon && <Icon className="size-3.5 text-muted-foreground/50 shrink-0 mt-0.5" />}
        {clamp ? (
          <span className="line-clamp-2 break-words" title={value ?? undefined}>
            {value ?? '—'}
          </span>
        ) : (
          value ?? '—'
        )}
      </span>
    </div>
  );
};

export default MetaItem;
