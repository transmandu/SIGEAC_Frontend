import { cn } from '@/lib/utils';
import { priorityLabel } from './utils/uiHelpers';

interface PriorityIndicatorProps {
  priority?: string;
}

const PriorityIndicator = ({ priority }: PriorityIndicatorProps) => {
  const level =
    priority === 'LOW'
      ? 1
      : priority === 'MEDIUM'
      ? 2
      : priority === 'HIGH'
      ? 3
      : 0

  const tone =
    priority === 'LOW'
      ? 'border-emerald-400/25 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300'
      : priority === 'MEDIUM'
      ? 'border-orange-400/25 bg-orange-500/5 text-orange-700 dark:text-orange-300'
      : priority === 'HIGH'
      ? 'border-red-400/25 bg-red-500/5 text-red-700 dark:text-red-300'
      : 'border-slate-200/20 bg-slate-500/5 text-muted-foreground'

  return (
    <div
      className={cn(
        'inline-flex items-center h-6 gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-semibold tracking-wide leading-none select-none',
        tone
      )}
    >
      {/* indicador compacto */}
      <div className="flex items-end gap-[2px] h-2.5">
        <div
          className={cn(
            'w-[2px] rounded-sm',
            level >= 1 ? 'h-1.5 bg-current opacity-60' : 'h-1 bg-current opacity-15'
          )}
        />
        <div
          className={cn(
            'w-[2px] rounded-sm',
            level >= 2 ? 'h-2 bg-current opacity-75' : 'h-1 bg-current opacity-15'
          )}
        />
        <div
          className={cn(
            'w-[2px] rounded-sm',
            level >= 3 ? 'h-2.5 bg-current opacity-90' : 'h-1 bg-current opacity-15'
          )}
        />
      </div>

      <span className="leading-none">
        {priorityLabel(priority)}
      </span>
    </div>
  )
}

export default PriorityIndicator;