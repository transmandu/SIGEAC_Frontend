import { useMemo } from "react";
import { FileBadge } from "lucide-react";

import CopyPartNumberButton from "@/components/misc/CopyPartNumberButton";

interface RequiredDocumentsSectionProps {
  batches: {
    batch_articles: {
      article_part_number: string;
      document_types?: {
        id: number;
        name: string;
        regulation?: string | null;
      }[];
    }[];
  }[];
}

const RequiredDocumentsSection = ({
  batches,
}: RequiredDocumentsSectionProps) => {
  const items = useMemo(() => {
    return batches
      .flatMap((batch) => batch.batch_articles ?? [])
      .filter((article) => (article.document_types?.length ?? 0) > 0)
      .sort((a, b) =>
        a.article_part_number.localeCompare(b.article_part_number),
      );
  }, [batches]);

  return (
    <div className="relative flex h-full flex-col rounded-xl border border-slate-200 bg-white dark:border-slate-700/60 dark:bg-slate-900/60 p-4 sm:p-5 shadow-xs">
      <div className="flex items-center gap-2 mb-3 select-none shrink-0">
        <FileBadge className="size-3 text-muted-foreground/70 shrink-0" />
        <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
          Documentos requeridos
        </span>
      </div>

      <div className="h-25 sm:h-30 overflow-y-auto">
        {items.length > 0 ? (
          <ul className="space-y-2">
            {items.map((article, idx) => (
              <li key={`${article.article_part_number}-${idx}`}>
                <div className="flex min-w-0 items-center gap-1">
                  <span className="truncate text-xs font-medium text-foreground/90">
                    {article.article_part_number}
                  </span>
                  <CopyPartNumberButton value={article.article_part_number} />
                </div>
                <ul className="mt-0.5 space-y-1 border-l border-border/50 pl-2">
                  {article.document_types!.map((type) => (
                    <li
                      key={type.id}
                      className="flex gap-1.5 text-[10.5px] leading-tight text-muted-foreground wrap-anywhere before:mt-[0.35em] before:size-1 before:shrink-0 before:rounded-full before:bg-muted-foreground/50 before:content-['']"
                    >
                      <span className="min-w-0">{type.name}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-muted-foreground select-none">
            <span className="text-xs text-center">
              Sin documentos requeridos
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequiredDocumentsSection;
