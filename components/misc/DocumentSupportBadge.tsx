import { cn } from "@/lib/utils";
import {
  DOCUMENT_SUPPORT_LABEL,
  getDocumentSupport,
} from "@/lib/warehouse/documents";

const TONE = {
  physical:
    "border-amber-300/60 bg-amber-50 text-amber-700 dark:border-amber-600/40 dark:bg-amber-950/30 dark:text-amber-400",
  digital:
    "border-emerald-300/60 bg-emerald-50 text-emerald-700 dark:border-emerald-700/40 dark:bg-emerald-950/30 dark:text-emerald-400",
  both: "border-sky-300/60 bg-sky-50 text-sky-700 dark:border-sky-700/40 dark:bg-sky-950/30 dark:text-sky-400",
} as const;

const SHORT_LABEL = {
  physical: "Solo físico",
  digital: "Digital",
  both: "Físico y digital",
} as const;

interface Props {
  doc: { file_path?: string | null; is_physical?: boolean };
  className?: string;
}

/** Indica si el documento está en papel, adjunto al sistema o ambos. */
export function DocumentSupportBadge({ doc, className }: Props) {
  const support = getDocumentSupport(doc);

  return (
    <span
      title={DOCUMENT_SUPPORT_LABEL[support]}
      className={cn(
        "inline-flex select-none items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
        TONE[support],
        className,
      )}
    >
      {SHORT_LABEL[support]}
    </span>
  );
}
