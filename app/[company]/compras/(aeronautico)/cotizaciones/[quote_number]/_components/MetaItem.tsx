import { ElementType } from 'react';
import { cn } from '@/lib/utils';

interface MetaItemProps {
  label: string;
  value?: string | null;
  icon?: ElementType;
  wrap?: boolean;
}

const MetaItem = ({ label, value, icon: Icon, wrap }: MetaItemProps) => {
  return (
    <div className={cn('flex flex-col gap-0.5', wrap && 'min-w-0 max-w-[260px]')}>
      <span className="text-[10px] font-medium tracking-wider text-muted-foreground/60 select-none">
        {label}
      </span>
      <span
        className={cn(
          'text-sm font-medium flex gap-1.5',
          wrap ? 'items-start text-wrap break-words' : 'items-center'
        )}
      >
        {Icon && <Icon className="size-3.5 text-muted-foreground/50 shrink-0 mt-0.5" />}
        {value ?? '—'}
      </span>
    </div>
  );
};

export default MetaItem;
