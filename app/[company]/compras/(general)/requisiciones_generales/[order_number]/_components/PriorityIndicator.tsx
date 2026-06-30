import { priorityPageBadgeCls, priorityLabel } from './utils/uiHelpers';

interface PriorityIndicatorProps {
  priority?: string;
}

const PriorityIndicator = ({ priority }: PriorityIndicatorProps) => {
  const level =
    priority === 'LOW' ? 1 : priority === 'MEDIUM' ? 2 : priority === 'HIGH' ? 3 : 0;

  return (
    <div className={priorityPageBadgeCls(priority)}>
      <div className="flex items-end gap-[2px] h-2.5 shrink-0">
        <div className={`w-[2px] rounded-sm ${level >= 1 ? 'h-1.5 bg-current opacity-60' : 'h-1 bg-current opacity-15'}`} />
        <div className={`w-[2px] rounded-sm ${level >= 2 ? 'h-2 bg-current opacity-75' : 'h-1 bg-current opacity-15'}`} />
        <div className={`w-[2px] rounded-sm ${level >= 3 ? 'h-2.5 bg-current opacity-90' : 'h-1 bg-current opacity-15'}`} />
      </div>
      <span className="leading-none">{priorityLabel(priority)}</span>
    </div>
  );
};

export default PriorityIndicator;
