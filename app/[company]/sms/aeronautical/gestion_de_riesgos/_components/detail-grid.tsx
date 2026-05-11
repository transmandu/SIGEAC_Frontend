import { cn } from '@/lib/utils';

import { DetailItem, hasDetailValue } from './report-helpers';

export function DetailGrid({ items }: { items: DetailItem[] }) {
    return (
        <div className="grid gap-3 md:grid-cols-2">
            {items.map(({ label, value, fullWidth, contentClassName }) => (
                <div
                    key={label}
                    className={cn('rounded-lg border bg-background p-3', fullWidth && 'md:col-span-2')}
                >
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {label}
                    </p>
                    <div
                        className={cn(
                            'mt-1 text-sm',
                            !hasDetailValue(value) && 'text-muted-foreground',
                            contentClassName
                        )}
                    >
                        {hasDetailValue(value) ? value : 'Sin informacion registrada'}
                    </div>
                </div>
            ))}
        </div>
    );
}
