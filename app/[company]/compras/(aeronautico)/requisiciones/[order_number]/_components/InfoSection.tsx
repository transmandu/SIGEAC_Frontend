import { ElementType } from 'react';

interface InfoSectionProps {
  title: string;
  icon: ElementType;
  content?: string | null;
  emptyMessage: string;
}

const InfoSection = ({ title, icon: Icon, content, emptyMessage }: InfoSectionProps) => {
  return (
    <div className="relative h-full flex flex-col rounded-xl border border-border/60 bg-gradient-to-b from-muted/30 to-muted/10 p-4 sm:p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-3 select-none shrink-0">
        <span className="text-[10px] sm:text-[11px] font-semibold tracking-widest text-muted-foreground whitespace-nowrap">
          {title}
        </span>
        <div className="h-px flex-1 bg-border/50" />
      </div>

      <div className="h-[100px] sm:h-[120px] overflow-y-auto flex items-center justify-center">
        {content?.trim() ? (
          <p className="w-full indent-5 text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
            {content}
          </p>
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-muted-foreground/60 select-none">
            <Icon className="size-4 opacity-60" />
            <span className="text-[10px] sm:text-[11px] tracking-widest">
              {emptyMessage}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default InfoSection;