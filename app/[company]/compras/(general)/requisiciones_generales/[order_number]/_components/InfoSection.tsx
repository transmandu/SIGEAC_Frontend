import { ElementType } from "react";
import LinkifiedText from "@/components/misc/LinkifiedText";

interface InfoSectionProps {
  title: string;
  icon: ElementType;
  content?: string | null;
  emptyMessage: string;
}

const InfoSection = ({
  title,
  icon: Icon,
  content,
  emptyMessage,
}: InfoSectionProps) => {
  return (
    <div className="relative min-w-0 rounded-xl border border-slate-200 bg-white dark:border-slate-700/60 dark:bg-slate-900/60 p-4 sm:p-5 shadow-xs">
      <div className="flex items-center gap-3 mb-3 select-none">
        <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
          {title}
        </span>
        <div className="h-px flex-1 bg-border/50" />
      </div>

      <div className="min-h-20 sm:min-h-25 flex items-center justify-center">
        {content?.trim() ? (
          <p className="w-full min-w-0 indent-5 text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
            <LinkifiedText text={content} />
          </p>
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-muted-foreground select-none">
            <Icon className="size-4 opacity-60" />
            <span className="text-xs">
              {emptyMessage}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoSection;
