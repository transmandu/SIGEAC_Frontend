import { ElementType } from 'react';

interface InfoSectionProps {
  title: string;
  icon: ElementType;
  content?: string | null;
  emptyMessage: string;
  compact?: boolean;
}

const InfoSection = ({ title, icon: Icon, content, emptyMessage, compact }: InfoSectionProps) => {
  return (
    <div className={`relative mx-auto rounded-xl border border-border/60 bg-gradient-to-b from-muted/30 to-muted/10 shadow-sm ${compact ? 'max-w-2xl p-4' : 'p-5'}`}>
      <div className="flex items-center gap-3 mb-3 select-none">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
          {title}
        </span>
        <div className="h-px flex-1 bg-border/50" />
      </div>

      <div className={`flex items-center justify-center ${compact ? 'min-h-[56px]' : 'min-h-[100px]'}`}>
        {content?.trim() ? (
          <p className="w-full indent-5 text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
            {content}
          </p>
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-muted-foreground/60 select-none">
            <Icon className="size-4 opacity-60" />
            <span className="text-[11px] tracking-widest uppercase">
              {emptyMessage}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoSection;
