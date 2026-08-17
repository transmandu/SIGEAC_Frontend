import { useMemo } from 'react';
import { FileBadge } from 'lucide-react';

interface RequiredDocumentsSectionProps {
  batches: {
    batch_articles: {
      article_part_number: string;
      document_types?: { id: number; name: string; regulation?: string | null }[];
    }[];
  }[];
}

const RequiredDocumentsSection = ({ batches }: RequiredDocumentsSectionProps) => {
  const items = useMemo(() => {
    return batches
      .flatMap((batch) => batch.batch_articles ?? [])
      .filter((article) => (article.document_types?.length ?? 0) > 0)
      .sort((a, b) => a.article_part_number.localeCompare(b.article_part_number));
  }, [batches]);

  return (
    <div className="relative flex h-full flex-col rounded-xl border border-border/60 bg-gradient-to-b from-muted/30 to-muted/10 p-4 sm:p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3 select-none shrink-0">
        <FileBadge className="size-3 text-muted-foreground/70 shrink-0" />
        <span className="text-[9px] sm:text-[10px] font-semibold tracking-widest text-muted-foreground whitespace-nowrap">
          DOCUMENTOS REQUERIDOS
        </span>
      </div>

      <div className="h-[100px] sm:h-[120px] overflow-y-auto">
        {items.length > 0 ? (
          <ul className="space-y-2">
            {items.map((article, idx) => (
              <li key={`${article.article_part_number}-${idx}`}>
                <span className="block text-[11px] font-medium text-foreground/90 truncate">
                  {article.article_part_number}
                </span>
                <ul className="mt-0.5 space-y-0.5 border-l border-border/50 pl-2">
                  {article.document_types!.map((type) => (
                    <li
                      key={type.id}
                      className="text-[10.5px] leading-tight text-muted-foreground truncate"
                    >
                      {type.name}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-muted-foreground/60 select-none">
            <span className="text-[9px] sm:text-[10px] tracking-widest text-center">
              SIN DOCUMENTOS REQUERIDOS
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequiredDocumentsSection;
