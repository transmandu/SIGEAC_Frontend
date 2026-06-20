import { ElementType } from 'react';

interface MetaItemProps {
  label: string;
  value?: string | null;
  icon?: ElementType;
}

const MetaItem = ({ label, value, icon: Icon }: MetaItemProps) => {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-medium tracking-wider text-muted-foreground/60 select-none">
        {label}
      </span>
      <span className="text-sm font-medium flex items-center gap-1.5">
        {Icon && <Icon className="size-3.5 text-muted-foreground/50 shrink-0" />}
        {value ?? '—'}
      </span>
    </div>
  );
}

export default MetaItem;